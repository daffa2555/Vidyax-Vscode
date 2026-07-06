const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

// The extension is a thin client: it launches `vidyax lsp` (the Language
// Server that ships with Vidyax) and lets it provide diagnostics,
// completion, hover, and document symbols. All the language smarts live
// in the server, so the editor experience always matches the CLI.

let client;

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

function startClient(context) {
    const command = resolveVidyaxCmd();
    // `vidyax lsp` speaks LSP over stdio.
    const serverOptions = {
        run:   { command, args: ['lsp'], transport: TransportKind.stdio },
        debug: { command, args: ['lsp'], transport: TransportKind.stdio },
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'vidyax' }],
        outputChannelName: 'Vidyax Language Server',
    };
    client = new LanguageClient(
        'vidyax', 'Vidyax Language Server', serverOptions, clientOptions);
    // start() rejects if the server can't be spawned; surface it once
    // instead of letting the promise go unhandled.
    client.start().catch((err) => {
        vscode.window.showWarningMessage(
            'Vidyax: could not start the language server (' +
            (err && err.message ? err.message : err) +
            '). Set "vidyax.path" to your vidyax executable if needed.');
    });
    context.subscriptions.push(client);
}

function activate(context) {
    // Command: run the current file in a terminal (unchanged).
    const runCmd = vscode.commands.registerCommand('vidyax.run', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
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
    context.subscriptions.push(runCmd);

    // Command: restart the language server (handy after updating vidyax).
    const restartCmd = vscode.commands.registerCommand(
        'vidyax.restartServer', async function () {
            if (client) {
                await client.stop();
            }
            startClient(context);
            vscode.window.showInformationMessage('Vidyax language server restarted.');
        });
    context.subscriptions.push(restartCmd);

    startClient(context);
}

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

module.exports = { activate, deactivate };
