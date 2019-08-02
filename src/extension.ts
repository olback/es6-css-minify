import * as vscode from 'vscode';
import * as path from 'path';
import { Config } from './config';
import { StatusBar } from './statusBar';
import { EXT_ID, SUPPORTED_FILES } from './utils';

let config = new Config(false);
let statusBar = new StatusBar;

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
            vscode.window.showInformationMessage('Minify');
        }),


        vscode.commands.registerCommand(`${EXT_ID}.minifySelection`, () => {
            vscode.window.showInformationMessage('Minify selection');
        })

    );


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


    console.log('es6-css-minify is now active!');

}

export function deactivate() { }
