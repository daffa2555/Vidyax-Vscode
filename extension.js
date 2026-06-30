const vscode = require('vscode');

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
}

function deactivate() {}
module.exports = { activate, deactivate };