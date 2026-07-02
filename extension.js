const vscode = require('vscode');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Live error checking ("garis merah") -----------------------------------
// Runs `vidyax check -`, feeds the document text via stdin, and turns the
// JSON error array it prints into VS Code diagnostics.

let diagnostics;            // DiagnosticCollection for the "vidyax" source
const debounceTimers = new Map();  // per-document debounce timers (by URI string)

// Resolve how to invoke the Vidyax CLI. VS Code launched from a desktop
// launcher often does NOT inherit ~/.local/bin on PATH, so relying on a
// bare "vidyax" can fail with ENOENT even when it works in the terminal.
// Order: user setting -> known absolute paths that exist -> bare "vidyax".
function resolveVidyaxCmd() {
    const configured = vscode.workspace.getConfiguration('vidyax').get('path');
    if (configured && fs.existsSync(configured)) {
        return configured;
    }
    const candidates = [
        path.join(os.homedir(), '.local', 'bin', 'vidyax'),
        '/usr/local/bin/vidyax',
        '/usr/bin/vidyax',
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) {
            return c;
        }
    }
    return 'vidyax';  // last resort: rely on PATH
}

function checkDocument(document) {
    if (!document || document.languageId !== 'vidyax') {
        return;
    }

    const source = document.getText();
    let stdout = '';
    let child;
    try {
        child = spawn(resolveVidyaxCmd(), ['check', '-']);
    } catch (err) {
        // vidyax not installed / cannot spawn: don't crash, just clear.
        diagnostics.delete(document.uri);
        return;
    }

    // If the process itself errors (e.g. ENOENT), clear and bail quietly.
    child.on('error', () => {
        diagnostics.delete(document.uri);
    });

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });

    child.on('close', () => {
        let errors;
        try {
            errors = JSON.parse(stdout);
        } catch (e) {
            // Bad / empty output: ignore, leave existing diagnostics untouched.
            return;
        }
        if (!Array.isArray(errors)) {
            return;
        }

        const items = [];
        for (const err of errors) {
            // Vidyax lines are 1-based; VS Code lines are 0-based.
            let line = (typeof err.line === 'number' ? err.line : 1) - 1;
            if (line < 0) line = 0;
            if (line >= document.lineCount) line = document.lineCount - 1;

            // No column info -> underline the whole line.
            const range = document.lineAt(line).range;
            const diag = new vscode.Diagnostic(
                range,
                String(err.message || 'error'),
                vscode.DiagnosticSeverity.Error
            );
            diag.source = 'vidyax';
            items.push(diag);
        }
        diagnostics.set(document.uri, items);
    });

    // Feed the source to the checker over stdin.
    try {
        child.stdin.write(source);
        child.stdin.end();
    } catch (e) {
        diagnostics.delete(document.uri);
    }
}

function scheduleCheck(document, delay) {
    if (!document || document.languageId !== 'vidyax') {
        return;
    }
    const key = document.uri.toString();
    const existing = debounceTimers.get(key);
    if (existing) {
        clearTimeout(existing);
    }
    debounceTimers.set(key, setTimeout(() => {
        debounceTimers.delete(key);
        checkDocument(document);
    }, delay));
}

function activate (context) {
    let disposable = vscode.commands.registerCommand('vidyax.run', function() {
        const editor = vscode.window.activeTextEditor;
        if (!editor){
            vscode.window.showErrorMessage('No file is open');
            return;
        }
        editor.document.save();
        const filePath = editor.document.fileName;

        let terminal = vscode.window.activeTerminal;
        if (!terminal) {
            terminal = vscode.window.createTerminal('Vidyax Terminal');
        }
        terminal.show();
        terminal.sendText(`vidyax "${filePath}"`);


    });
    context.subscriptions.push(disposable);

    // --- live diagnostics ---
    diagnostics = vscode.languages.createDiagnosticCollection('vidyax');
    context.subscriptions.push(diagnostics);

    // Check on open (no debounce needed).
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((doc) => checkDocument(doc))
    );
    // Check while typing, debounced so we don't spawn on every keystroke.
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => scheduleCheck(e.document, 300))
    );
    // Check on save (immediate).
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((doc) => checkDocument(doc))
    );
    // Drop diagnostics when a document is closed.
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri))
    );

    // Check any Vidyax documents already open at activation.
    vscode.workspace.textDocuments.forEach((doc) => checkDocument(doc));
}

function deactivate() {}
module.exports = { activate, deactivate };
