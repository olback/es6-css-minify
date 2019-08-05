import * as vscode from 'vscode';
import * as path from 'path';
import { Config } from './config';
import { statusBar } from './status-bar';
import { EXT_ID, SUPPORTED_FILES } from './utils';
import { output } from './output';
import { File } from './fs';
import { minifyDocument } from './minify-document';
import { minifySelection } from './minify-selection';

let config = new Config(false);

export function activate(context: vscode.ExtensionContext) {

    // Load config
    config = new Config(true);


    // Show minify button
    statusBar.showButton();


    // Commands
    context.subscriptions.push(

        vscode.commands.registerCommand(`${EXT_ID}.loadConfig`, () => {

            config = new Config();
            vscode.window.showInformationMessage('Minify configuration reloaded.');

        }),


        vscode.commands.registerCommand(`${EXT_ID}.minify`, () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('No document open.');
                return;
            }

            if (editor.document.isUntitled) {
                vscode.window.showErrorMessage('File must be saved before it can be minified.');
                return;
            }

            minifyDocument(editor.document, config);

        }),


        vscode.commands.registerCommand(`${EXT_ID}.minifySelection`, () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('No editor open.');
                return;
            }

            minifySelection(editor, config);

        })

    );

    // TODO: Minify on save
    // vscode.workspace.onDidSaveTextDocument(doc => {

    //     if (config.minifyOnSave === false || config.minifyOnSave === 'no' || !SUPPORTED_FILES.includes(doc.languageId)) {
    //         return;
    //     }

    //     if (config.minifyOnSave === 'exists') {
    //         if (!new File().exists()) {
    //             return;
    //         }
    //     }

    //     // This is a hack to get arround bad/old hardware.
    //     if (config.onSaveDelay) {
    //         setTimeout(() => {
    //             minifyDocument(doc, config);
    //         }, config.onSaveDelay);
    //     } else {
    //         minifyDocument(doc, config);
    //     }

    // });


    // Hide the minify button unless the active document is a non-minified JS/CSS file.
    vscode.workspace.onDidOpenTextDocument(() => {

        if (!vscode.window.activeTextEditor || config.hideButton === false) {
            return;
        }

        const doc = vscode.window.activeTextEditor.document;

        if (SUPPORTED_FILES.includes(doc.languageId) && !path.basename(doc.fileName).includes('.min.')) {
            statusBar.showButton();
        } else {
            statusBar.hideButton();
        }

    });


    // Reload minify config if the vscode config is modified
    vscode.workspace.onDidChangeConfiguration(() => {

        config = new Config(true);
        vscode.window.showInformationMessage('Minify configuration reloaded.');

    });


    console.log('es6-css-minify 3 is now active!');

}

export function deactivate() {
    output.dispose();
}
