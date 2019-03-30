'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as terser from 'terser';
import * as cleancss from 'clean-css';
import * as autoprefixer from 'autoprefixer';

type ConfSettings = {
    showMessage: boolean;
    loadExternal: boolean;
    setGlobal: boolean;
};

type FileStats = {
    original: number;
    minified: number;
};

namespace Config {

    export type minifyOnSave = 'yes' | 'no' | 'exists' | boolean;
    export type path = string;
    export type bool = boolean;
    export type str = string;
    export type _ = any;

}

type Config = {

    // General extension settings
    minifyOnSave: Config.minifyOnSave;
    hideButton: Config.bool;

    // JS
    uglifyConfigFile: Config.path;
    genJSmap: Config.bool;
    jsMapSource: Config.path;
    jsMinPath: Config.path;
    jsPostfix: Config.str;
    js: Config._;

    // CSS
    cleancssConfigFile: Config.path;
    genCSSmap: Config.bool;
    cssMapSource: Config.path;
    cssMinPath: Config.path;
    cssPostfix: Config.str;
    css: Config._;

    // Autoprefixer (CSS)
    enableAutoprefixer: Config.bool;
    autoprefixer: Config._;
};

// Store config in a global variable
let config: Config;
let minifyButton: vscode.StatusBarItem;

// Extension name
const ex: string = 'es6-css-minify';

// Load config
// export function loadConfig(showMessage = true, loadExternal = true, setGlobal = true): Config {
function loadConfig(settings: ConfSettings = { showMessage: true, loadExternal: true, setGlobal: true }): Config {

    // Load config and make sure it's not read-only
    let _config: Config = JSON.parse(JSON.stringify(vscode.workspace.getConfiguration(ex)));

    // If there is no workspace, don't continue
    if (!vscode.workspace.workspaceFolders) {
        return _config;
    }

    // console.log('vsc path: ' + vscode.workspace.workspaceFolders[0].uri.fsPath);
    // console.log('s path: ' + config.uglifyConfigFile);

    if (settings.loadExternal) {

        // Load uglify config if it exists
        const uglifyrcPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, _config.uglifyConfigFile);
        if (fs.existsSync(uglifyrcPath)) {

            try {

                _config.js = JSON.parse(fs.readFileSync(uglifyrcPath, 'utf8'));
                // console.log(`${uglifyrcPath} loaded.`);

            } catch (e) {

                console.error(`Failed to parse ${uglifyrcPath}. ${e}.`);
                vscode.window.showErrorMessage(`Failed to parse ${uglifyrcPath}. ${e}.`);
                // return _config;

            }

        }

        // Load cleancss config if it exists
        const cleancssrcPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, _config.cleancssConfigFile);
        if (fs.existsSync(cleancssrcPath)) {

            try {

                _config.css = JSON.parse(fs.readFileSync(cleancssrcPath, 'utf8'));
                // console.log(`${cleancssrcPath} loaded.`);

            } catch (e) {

                console.error(`Failed to parse ${cleancssrcPath}. ${e}.`);
                vscode.window.showErrorMessage(`Failed to parse ${cleancssrcPath}. ${e}.`);
                // return _config;

            }

        }

    }

    if (settings.setGlobal) {
        config = _config;
    }

    if (settings.showMessage) {
        vscode.window.showInformationMessage('Minify configuration reloaded.');
    }

    return _config;

}

function getMinOutPath(doc: vscode.TextDocument): string {

    const file = {
        basename: path.basename(doc.uri.fsPath),
        extname: path.extname(doc.uri.fsPath),
        dirname: path.dirname(doc.uri.fsPath),
        absolute: doc.uri.fsPath,
        languageId: doc.languageId
    };

    let outNameParts = file.basename.split('.');

    outNameParts.pop();

    if (config.jsPostfix && file.languageId === 'javascript') {

        outNameParts.push(config.jsPostfix);

    } else if (config.cssPostfix && file.languageId === 'css') {

        outNameParts.push(config.cssPostfix);

    }

    outNameParts.push(file.extname.replace('.', ''));
    const baseOut = outNameParts.join('.');

    let outPath: string;

    if (file.languageId === 'javascript') {

        if (config.jsMinPath && vscode.workspace.workspaceFolders) {
            outPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.jsMinPath, baseOut);
        } else {
            outPath = path.join(file.dirname, baseOut);
        }

    } else if (file.languageId === 'css') {

        if (config.cssMinPath && vscode.workspace.workspaceFolders) {
            outPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.cssMinPath, baseOut);
        } else {
            outPath = path.join(file.dirname, baseOut);
        }

    } else {

        outPath = '';

    }

    return outPath;
}

function sendToFile(path: string, content: string, stats?: FileStats): void {

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

    const active = vscode.window.activeTextEditor;

    // No document open
    if (!active || !active.document) {
        return;
    }

    // Document never written to disc
    if (active.document.isUntitled) {
        vscode.window.setStatusBarMessage('File must be saved before minify can run', 5000);
        return;
    }

    const doc = active.document;

    if (doc.languageId !== 'javascript' && doc.languageId !== 'css' && doc.languageId !== 'json') {
        vscode.window.showWarningMessage(`File with type ${doc.languageId} is not supported by ${ex}`);
        return;
    }

    const file = {
        basename: path.basename(doc.uri.fsPath),
        extname: path.extname(doc.uri.fsPath),
        dirname: path.dirname(doc.uri.fsPath),
        content: doc.getText(),
        outpath: getMinOutPath(doc),
        languageId: doc.languageId
    };

    if (file.basename.split('.').length > 2) {

        const postfix = file.basename.split('.')[file.basename.split('.').length - 2];

        if ((file.languageId === 'css' && postfix === config.cssPostfix) || (file.languageId === 'javascript' && postfix === config.jsPostfix)) {
            vscode.window.showWarningMessage(`Could not minify ${file.basename}. File already minified.`);
            return;
        }

    }

    // Make sure the out path exist
    if (!fs.existsSync(path.dirname(file.outpath))) {
        vscode.window.showWarningMessage(`Could not write file to folder ${path.dirname(file.outpath)}. Path not found.`);
        return;
    }

    let stats = {
        original: file.content.length,
        minified: 0
    };

    if (doc.languageId === 'javascript') {

        try {

            let fileData: any = {};
            fileData[file.basename] = file.content;

            if (config.genJSmap) {

                config.js.sourceMap = {
                    filename: config.jsMapSource ? path.join(config.jsMapSource, file.basename) : file.basename,
                    url: path.basename(file.outpath) + '.map'
                };

            }

            let r = terser.minify(file.content, config.js);

            if (!r.code.length) {
                vscode.window.showErrorMessage('Minify failed.');
                return;
            }

            stats.minified = r.code.length;

            sendToFile(file.outpath, r.code, stats);

            if (r.map) {
                let map = JSON.parse(r.map);
                map.sources[0] = config.jsMapSource ? path.join(config.jsMapSource, file.basename) : file.basename;
                sendToFile(file.outpath + '.map', JSON.stringify(map));
            }

        } catch (e) {

            vscode.window.showErrorMessage(`Minify failed. This is probably caused by a syntax error. Error message: ${e.message}.`);

        }


    } else if (doc.languageId === 'css') {

        if (config.genCSSmap) {
            config.css.sourceMap = true;
        }

        const cssMinify = new cleancss(config.css);

        let cssContent = file.content;

        if (config.enableAutoprefixer) {

            try {

                cssContent = autoprefixer.process(cssContent, config.autoprefixer).toString();

            } catch (e) {

                vscode.window.showErrorMessage('Autoprefixer failed to parse CSS.');
                return;

            }
        }

        cssMinify.minify(cssContent, (_, res) => {

            if (res && res.styles) {

                stats.minified = res.styles.length;

                if (config.genCSSmap) {

                    const mapPath = file.outpath + '.map';
                    sendToFile(file.outpath, `${res.styles}\n/*# sourceMappingURL=${path.basename(mapPath)} */\n`, stats);

                    // Modify sources before writing to file
                    let sm = JSON.parse(JSON.stringify(res.sourceMap));

                    if (config.cssMapSource !== '') {
                        sm.sources[0] = path.join(config.cssMapSource, file.basename);
                    } else {
                        sm.sources[0] = file.basename;
                    }

                    sendToFile(mapPath, JSON.stringify(sm));

                } else {

                    sendToFile(file.outpath, res.styles, stats);

                }

            } else {

                vscode.window.showErrorMessage(`Minify failed.`);

            }

        });

    } else if (doc.languageId === 'json') {

        vscode.window.showWarningMessage('JSON File minification is currently not supported. Select the data you want to miniyf and use \'Minify Selection\'.');

    }

}

function minifySelection() {

    const editor = vscode.window.activeTextEditor;

    if (editor) {

        const text = editor.document.getText(editor.selection);

        if (!text.trim()) {
            vscode.window.showWarningMessage('No text selected.');
            return;
        }

        if (editor.document.languageId === 'css') {

            const output = new cleancss(config.css).minify(text);

            if (output.errors.length || !output.styles.trim().length) {

                const err = JSON.stringify(output.errors);

                vscode.window.showErrorMessage(`Error minifying selection. ${output.errors.length ? err : 'Invalid CSS?'}`);

            } else {

                editor.insertSnippet(new vscode.SnippetString(output.styles));

            }


        } else if (editor.document.languageId === 'javascript') {

            const output = terser.minify(text, config.js);

            if (output.code) {

                editor.insertSnippet(new vscode.SnippetString(output.code));

            } else if (output.error) {

                const err = output.error;

                vscode.window.showErrorMessage(`${err.message} at ${err.line}:${err.col}. Pos: ${err.pos} of selection.`);

            } else {

                vscode.window.showErrorMessage('Unkown error.');

            }


        } else if (editor.document.languageId === 'json') {

            try {

                const output = JSON.stringify(JSON.parse(text));
                editor.insertSnippet(new vscode.SnippetString(output));

            } catch (e) {

                vscode.window.showErrorMessage('Failed to minify selection. This is most likely due to a syntax error.');

            }

        } else {

            vscode.window.showErrorMessage('Language not supported.');

        }

    } else {

        vscode.window.showErrorMessage('No document open.');

    }

}

function activate(context: vscode.ExtensionContext) {

    config = loadConfig({
        showMessage: false,
        loadExternal: true,
        setGlobal: false,
    });

    context.subscriptions.push(
        vscode.commands.registerCommand(`${ex}.loadConfig`, loadConfig),
        vscode.commands.registerCommand(`${ex}.minify`, minify),
        vscode.commands.registerCommand(`${ex}.minifySelection`, minifySelection)
    );

    // Add 'Minify' status bar button
    minifyButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    minifyButton.text = 'Minify';
    minifyButton.command = `${ex}.minify`;
    minifyButton.tooltip = 'Minify current file';
    minifyButton.show();

    vscode.workspace.onDidSaveTextDocument(doc => {

        if ((doc.languageId === 'css' || doc.languageId === 'javascript') && config.minifyOnSave !== 'no' && config.minifyOnSave !== false) {

            const outPath = getMinOutPath(doc);

            if (config.minifyOnSave === 'exists' && fs.existsSync(outPath)) {

                minify();

            } else if (config.minifyOnSave === 'yes' || config.minifyOnSave === true) {

                minify();

            }

        }

    });

    // Hide the minify button unless the active document is a non-minified JS/CSS file.
    vscode.workspace.onDidOpenTextDocument(() => {

        if (!vscode.window.activeTextEditor || config.hideButton === false) {
            return;
        }

        const doc: vscode.TextDocument = vscode.window.activeTextEditor.document;

        const da = doc.uri.fsPath.split('.');

        const supported: string[] = [
            'javascript',
            'css'
        ];

        if (supported.indexOf(doc.languageId) < 0 || da[da.length - 2] === 'min') {
            minifyButton.hide();
        } else {
            minifyButton.show();
        }

    });

    vscode.workspace.onDidChangeConfiguration(() => {

        config = loadConfig({
            showMessage: true,
            loadExternal: true,
            setGlobal: false,
        });

    });

    console.log('es6-css-minify 2 is now active!');

}

// This method is called when your extension is deactivated
function deactivate() {
}

export {
    activate,
    deactivate,
    loadConfig,
    getMinOutPath,
    minify,
    ex
};
