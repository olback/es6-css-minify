/**
 * ES5/ES6/CSS Minifier
 * github.com/olback/es6-css-minify
 */

'use strict';

const vscode = require('vscode');
const minJS = require('uglify-es');
const mincss = require('clean-css');
const fs = require('fs');
const os = require('os');

const ex = 'es6-css-minify';
const statusBarItems = [];

let settings;
let fileConf = {}

function addStatusBarItem(str, cmd, tip, col) { // (name, command, tooltip, color)
    statusBarItems.push(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left));
    statusBarItems[statusBarItems.length - 1].text = str;
    if (cmd) statusBarItems[statusBarItems.length - 1].command = cmd;
    if (tip) statusBarItems[statusBarItems.length - 1].tooltip = tip;
    if (col) statusBarItems[statusBarItems.length - 1].color = col;
    statusBarItems[statusBarItems.length - 1].show();
}

function sendFileOut(fileName, data, stats) {
    fs.writeFile(fileName, data, "utf8", () => {
        let status = "Minified: " + stats.files + " files";
        if (stats.length) status = "Minified: " + (100 - (((data.length / stats.length) * 10000) | 0) / 100) +
            "% of original" + (stats.errors ? " but with errors." : (stats.warnings ? " but with warnings." : "."));
        vscode.window.setStatusBarMessage(status, 5000);
    });
}

function doMinify(doc) {

    let outName = doc.fileName.split('.');
    if (outName[outName.length - 2] === 'min') return vscode.window.setStatusBarMessage("Cannot minify minified file.", 5000);
    const ext = outName.pop();
    outName.push("min");
    outName.push(ext);
    outName = outName.join('.');
    let data = doc.getText();
    let baseName;

    if(os.type() === 'Windows_NT') {
        baseName = outName.split('\\').pop();
    } else {
        baseName = outName.split('/').pop();
    }

    let fileData = {}
    fileData[baseName.replace('.min.', '.')] = data;
    
    //if the document is empty here, we output an empty file to the min point
    if (!data.length) return sendFileOut(outName, "", {
        length: 1
    });

    const isJS = ext.toLocaleLowerCase() === 'js';
    const isCSS = ext.toLocaleLowerCase() === 'css';

    if (isJS) {

        try {

            let results;

            if (typeof fileConf.js === 'object') {

                results = minJS.minify(fileData, fileConf.js);

            } else {

                // results = minJS.minify(data, settings.js); // Stopped working with the March 1.22.1 release of vscode.
                // settings.js is frozen, make a copy of it so that uglify can mess arround with the object passed.
                let jss = JSON.parse(JSON.stringify(settings.js));

                if (settings.genJSmap) {

                    jss.sourceMap = {
                        filename: outName,
                        url: settings.jsMapUrl + baseName + '.map'
                    }

                }

                results = minJS.minify(fileData, jss);

            }

            sendFileOut(outName, results.code, {
                length: data.length
            });

            if (settings.genJSmap) {
                sendFileOut(outName + '.map', results.map);
            }

        } catch (e) {

            vscode.window.setStatusBarMessage("Minify failed: " + e.message, 5000);

        }

    } else if (isCSS) {

        let cleanCSS;

        if (typeof fileConf.css === 'object') {

            cleanCSS = new mincss(fileConf.css);

        } else {

            let ccsss = JSON.parse(JSON.stringify(settings.css));

            if (settings.genCSSmap) {
                ccsss.sourceMap = true
            }

            cleanCSS = new mincss(ccsss);

        }

        cleanCSS.minify(data, (error, results) => {

            if (results && results.styles) {
                /*# sourceMappingURL=styles.css.map */

                if (settings.genCSSmap) {

                    sendFileOut(outName, results.styles+'\n/*# sourceMappingURL='+settings.cssMapUrl+baseName+'.map */', {
                        length: data.length,
                        warnings: results.warnings.length,
                        errors: results.errors.length
                    });

                    let sm = JSON.parse(JSON.stringify(results.sourceMap));
                    sm.sources[0] = baseName.replace('.min.', '.');
                    sendFileOut(outName + '.map', JSON.stringify(sm));

                    return;

                }

                sendFileOut(outName, results.styles, {
                    length: data.length,
                    warnings: results.warnings.length,
                    errors: results.errors.length
                });

            } else if (error) {

                vscode.window.setStatusBarMessage("Minify failed: " + error.length + " error(s).", 5000);

            }

        });

    } else {

        vscode.window.setStatusBarMessage("Can only minify JavaScript and CSS.", 5000);

    }

}

function loadConfig(notify) {

    fileConf = {} // Reset fileConf on reload

    settings = vscode.workspace.getConfiguration('es6-css-minify');

    const rootPath = vscode.workspace.workspaceFolders[0].uri.path + '/';

    if (fs.existsSync(rootPath + settings.uglifyConfigFile)) {
        fileConf.js = JSON.parse(fs.readFileSync(rootPath + settings.uglifyConfigFile, 'utf8'));
    }

    if (fs.existsSync(rootPath + settings.cleancssConfigFile)) {
        fileConf.css = JSON.parse(fs.readFileSync(rootPath + settings.cleancssConfigFile, 'utf8'));
    }

    if (notify) vscode.window.showInformationMessage('ES5/ES6/CSS Minifier config reloaded');

}

function activate(context) {

    console.log('es6-css-minify is now active!');
    addStatusBarItem('|');
    addStatusBarItem('Minify', ex + '.minify', 'Minify file');

    loadConfig(false);

    context.subscriptions.push(vscode.commands.registerCommand(ex + '.minify', () => {
        const active = vscode.window.activeTextEditor;
        if (!active || !active.document) return;

        if (active.document.isUntitled) return vscode.window.setStatusBarMessage(
            "File must be saved before minify can run",
            5000);

        return doMinify(active.document);
    }));

    context.subscriptions.push(vscode.commands.registerCommand(ex + '.reload', () => {
        loadConfig(true);
    }));

    vscode.workspace.onDidSaveTextDocument((e) => {

        if ((e.languageId === 'css' || e.languageId === 'javascript') && settings.minifyOnSave !== 'no' && settings.minifyOnSave !== false) {

            if (settings.minifyOnSave === 'exists') {
                let outName = e.fileName.split('.');
                const ext = outName.pop();
                outName.push('min');
                outName.push(ext);
                outName = outName.join('.');

                if (!fs.existsSync(outName)) {
                    return;
                }
            }

            setTimeout(() => {
                doMinify(e);
            }, 100);

        }

    });

}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {

}

exports.deactivate = deactivate;
