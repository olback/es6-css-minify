/**
 * ES5/ES6/CSS Minifier
 * github.com/olback/es6-css-minify
 */

'use strict';

const vscode = require('vscode');
const minJS = require('uglify-es');
const mincss = require('clean-css');
const fs = require('fs');

const ex = 'es6-css-minify';
const statusBarItems = [];
const quotedStyles = ['auto', 'single', 'double', 'original'];

const minJSopts = {
	"mangle": true,
	"compress": {
		"unused": false
	},
	"output": {
		"quote_style": quotedStyles.indexOf('single')
	}
}

const minCSSopts = {
    rebase: false
}

// TODO: Load from vs code settings, FIXME: before release!
const settings = {
    minifyOnSave: false
}

let WSSettings;

function addStatusBarItem(str, cmd, tip, col) { // (name, command, tooltip, color)
    statusBarItems.push(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left));
    statusBarItems[statusBarItems.length-1].text = str;
    if(cmd) statusBarItems[statusBarItems.length-1].command = cmd;
    if(tip) statusBarItems[statusBarItems.length-1].tooltip = tip;
    if(col) statusBarItems[statusBarItems.length-1].color = col;
    statusBarItems[statusBarItems.length-1].show();
}

function sendFileOut(fileName, data, stats) {
    fs.writeFile(fileName, data, "utf8", () => {
        let status = "Minified: " + stats.files + " files";
        if (stats.length) status = "Minified: " + (100 - (((data.length / stats.length) * 10000) | 0) / 100) +
            "% of original" + (stats.errors ? " but with errors." : (stats.warnings ? " but with warnings." : "."));
        vscode.window.setStatusBarMessage(status, 5000);
    });
};

function doMinify(doc) {

    let outName = doc.fileName.split('.');
    if(outName[outName.length - 2] === 'min') return vscode.window.setStatusBarMessage("Cannot minify minified file.", 5000);
    const ext = outName.pop();
    outName.push("min");
    outName.push(ext);
    outName = outName.join('.');
    let data = doc.getText();
    //if the document is empty here, we output an empty file to the min point
    if (!data.length) return sendFileOut(outName, "", {
        length: 1
    });

    const isJS = ext.toLocaleLowerCase() === 'js';
    const isCSS = ext.toLocaleLowerCase() === 'css';

    if(isJS) {
        
        try {

            let results = minJS.minify(data, minJSopts);
            sendFileOut(outName, results.code, {
                length: data.length
            });

        } catch(e) {

            vscode.window.setStatusBarMessage("Minify failed: " + e.message, 5000);

        }

    } else if(isCSS) {

        let cleanCSS = new mincss(minCSSopts);

        cleanCSS.minify(data, (error, results) => {

            if (results && results.styles) sendFileOut(outName, results.styles, {
                length: data.length,
                warnings: results.warnings.length,
                errors: results.errors.length
            })
            else if(error) vscode.window.setStatusBarMessage("Minify failed: " + error.length + " error(s).", 5000);

        });

    } else {

        vscode.window.setStatusBarMessage("Can only minify JavaScript and CSS.", 5000);

    }
    
}

function activate(context) {
    
    console.log('es6-css-minify is now active!');
    addStatusBarItem('|');
    addStatusBarItem('Minify', ex+'.minify', 'Minify file');

    WSSettings = vscode.workspace.getConfiguration('es6-css-minify');
    console.log(WSSettings);

    let disposable = vscode.commands.registerCommand(ex+'.minify', function () {

        const active = vscode.window.activeTextEditor;
        if (!active || !active.document) return;

        if (active.document.isUntitled) return vscode.window.setStatusBarMessage(
			"File must be saved before minify can run",
            5000);
        
		return doMinify(active.document);

    });

    context.subscriptions.push(disposable);

    vscode.workspace.onDidSaveTextDocument((e) => {
        if((e.languageId === 'css' || e.languageId === 'js') && settings.minifyOnSave) {
            setTimeout(() => {
                doMinify(e);
            }, 100);
            console.log('triggerd');
        }
    });

}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {

}

exports.deactivate = deactivate;
