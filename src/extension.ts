'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as uglify from 'uglify-es';
import * as cleancss from 'clean-css';

interface FileData {
    original: number;
    minified: number;
}

// Store settings in a global variable
let settings: any;

// Extension name
const ex = 'es6-css-minify';

// Load settings
function loadConfig(showMessage = true): void {

    // Load settings and make sure it's not read-only
    settings = JSON.parse(JSON.stringify(vscode.workspace.getConfiguration('es6-css-minify')));

    // If there is no workspace, don't continue
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    // console.log('vsc path: ' + vscode.workspace.workspaceFolders[0].uri.path);
    // console.log('s path: ' + settings.uglifyConfigFile);

    // Load uglify config if it exists
    const uglifyrcPath = path.join(vscode.workspace.workspaceFolders[0].uri.path, settings.uglifyConfigFile);
    if (fs.existsSync(uglifyrcPath)) {

        try {

            settings.js = JSON.parse(fs.readFileSync(uglifyrcPath, 'utf8'));
            // console.log(`${uglifyrcPath} loaded.`);

        } catch (e) {

            console.error(`Failed to parse ${uglifyrcPath}. ${e}.`);
            vscode.window.showErrorMessage(`Failed to parse ${uglifyrcPath}. ${e}.`);
            return;

        }

    }

    // Load cleancss config if it exists
    const cleancssrcPath = path.join(vscode.workspace.workspaceFolders[0].uri.path, settings.cleancssConfigFile);
    if (fs.existsSync(cleancssrcPath)) {

        try {

            settings.css = JSON.parse(fs.readFileSync(cleancssrcPath, 'utf8'));
            // console.log(`${cleancssrcPath} loaded.`);

        } catch (e) {

            console.error(`Failed to parse ${cleancssrcPath}. ${e}.`);
            vscode.window.showErrorMessage(`Failed to parse ${cleancssrcPath}. ${e}.`);
            return;

        }

    }

    if (showMessage) {
        vscode.window.showInformationMessage('Minify configuration config reloaded.');
    }

}

function sendToFile(path: string, content: string, stats?: FileData): void {

    // console.log('path: ' + path);
    // console.log('content: ' + content);
    // console.log(`Original: ${stats.original}\nMinified: ${stats.minified}`);

    if (stats) {
        const minPercentage = 100 - ((stats.minified / stats.original) * 100);
        vscode.window.setStatusBarMessage(`Minified file is ${String(minPercentage).substr(0, 5)}% smaller.`, 5000);
    }

    fs.writeFileSync(path, content, 'utf8');

}

function minify(): void {

    console.log('wsf: ' + vscode.workspace.workspaceFolders);

    const active = vscode.window.activeTextEditor;

    // No document open
    if (!active || !active.document) {
        return;
    }

    // Document never written to disc
    if (active.document.isUntitled) {
        vscode.window.setStatusBarMessage("File must be saved befor minify can run", 5000);
        return;
    }

    const doc = active.document;

    if (doc.languageId !== 'javascript' && doc.languageId !== 'css') {
        vscode.window.showWarningMessage(`File with type ${doc.languageId} is not supported by ${ex}`);
        return;
    }

    const file = {
        basename: path.basename(doc.uri.fsPath),
        extname: path.extname(doc.uri.fsPath),
        dirname: path.dirname(doc.uri.fsPath),
        absolute: doc.uri.fsPath,
        content: doc.getText()
    };

    let outNameParts = file.basename.split('.');

    if (outNameParts[outNameParts.length - 2] === 'min') {
        return;
    }

    outNameParts.pop();
    outNameParts.push('.min');
    outNameParts.push(file.extname);
    const baseOut = outNameParts.join('');

    let stats = {
        original: file.content.length,
        minified: 0
    };

    if (doc.languageId === 'javascript') {

        let outPath: string;

        if (settings.jsMinPath && vscode.workspace.workspaceFolders) {
            outPath = path.join(vscode.workspace.workspaceFolders[0].uri.path, settings.jsMinPath, baseOut);
        } else {
            outPath = path.join(file.dirname, baseOut);
        }

        try {

            let fileData: any = {};
            fileData[file.basename] = file.content;

            if(settings.genJSmap) {

                settings.js.sourceMap = {
                    filename: settings.jsMapSource ? path.join(settings.jsMapSource, file.basename) : file.basename,
                    url: baseOut + '.map'
                };

            }

            let r = uglify.minify(file.content, settings.js);

            if(!r.code.length) {
                vscode.window.showErrorMessage('Minify failed.');
                return;
            }

            stats.minified = r.code.length;

            sendToFile(outPath, r.code, stats);

            if (r.map) {
                let map = JSON.parse(r.map);
                map.sources[0] = settings.jsMapSource ? path.join(settings.jsMapSource, file.basename) : file.basename;
                sendToFile(outPath + '.map', JSON.stringify(map));
            }

        } catch(e) {

            vscode.window.showErrorMessage(`Minify failed: ${e.message}.`);

        }


    } else if (doc.languageId === 'css') {

        let outPath: string;

        if (settings.cssMinPath && vscode.workspace.workspaceFolders) {
            outPath = path.join(vscode.workspace.workspaceFolders[0].uri.path, settings.cssMinPath, baseOut);
        } else {
            outPath = path.join(file.dirname, baseOut);
        }

        if (settings.genCSSmap) {
            settings.css.sourceMap = true;
        }

        const cssMinify = new cleancss(settings.css);

        cssMinify.minify(file.content, (err, res) => {

            if (res && res.styles) {

                stats.minified = res.styles.length;

                if (settings.genCSSmap) {

                    const mapPath = outPath + '.map';
                    sendToFile(outPath, `${res.styles}\n/*# sourceMappingURL=${path.basename(mapPath)} */\n`, stats);

                    // Modify sources before writing to file
                    let sm = JSON.parse(JSON.stringify(res.sourceMap));

                    if (settings.cssMapSource !== '') {
                        sm.sources[0] = path.join(settings.cssMapSource, file.basename);
                    } else {
                        sm.sources[0] = file.basename;
                    }

                    sendToFile(mapPath, JSON.stringify(sm));

                } else {

                    sendToFile(outPath, res.styles, stats);

                }

            } else {

                vscode.window.showErrorMessage(`Minify failed.`);

            }

        });

    }

}

export function activate(context: vscode.ExtensionContext) {

    loadConfig(false);

    context.subscriptions.push(
        vscode.commands.registerCommand(`${ex}.loadConfig`, loadConfig),
        vscode.commands.registerCommand(`${ex}.minify`, minify)
    );

    // Add 'Minify' status bar button
    const minifyButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    minifyButton.text = 'Minify';
    minifyButton.command = `${ex}.minify`;
    minifyButton.tooltip = 'Minify current file';
    minifyButton.show();

    console.log('es6-css-minify 2 is now active!');
}

// this method is called when your extension is deactivated
export function deactivate() {
}
