import * as vscode from 'vscode';
import * as path from 'path';
import { config } from './config';
import { output } from './output';
import { CssMinifier } from './css';
import { EsMinifier } from './js';
import { JsonMinifier } from './json';
import { statusBar } from './status-bar';

export function minifySelection(editor: vscode.TextEditor): void {

    console.log(config);

    const text = editor.document.getText(editor.selection);

        if (!text.trim()) {
            vscode.window.showWarningMessage('No text selected.');
            return;
        }

        switch (editor.document.languageId) {

            case 'css': {
                const minifier = new CssMinifier(config.css, { use: config.enableAutoprefixerSelection, options: config.autoprefixer });
                const fileName = path.basename(editor.document.fileName);
                const res = minifier.minify(text);
                output.printMinifyResult(`${fileName} (selection)`, res);
                if (res.success) {
                    editor.insertSnippet(new vscode.SnippetString(res.output.code));
                    statusBar.showStats(res.efficiency);
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                } else {
                    vscode.window.showErrorMessage('Failed to minify selection. See output for more info.');
                    if (config.showLogOnError) {
                        output.show();
                    }
                }
                break;
            }

            case 'javascript': {
                const minifier = new EsMinifier(config.js);
                const fileName = path.basename(editor.document.fileName);
                const res = minifier.minify(text, null, config.jsMapSource);
                output.printMinifyResult(`${fileName} (selection)`, res);
                if (res.success) {
                    editor.insertSnippet(new vscode.SnippetString(res.output.code));
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                } else {
                    vscode.window.showErrorMessage('Failed to minify selection. See output for more info.');
                    if (config.showLogOnError) {
                        output.show();
                    }
                }
                break;
            }

            case 'json': {
                const minifier = new JsonMinifier();
                const fileName = path.basename(editor.document.fileName);
                const res = minifier.minify(text);
                output.printMinifyResult(`${fileName} (selection)`, res);
                if (res.success) {
                    editor.insertSnippet(new vscode.SnippetString(res.output.code));
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                } else {
                    vscode.window.showErrorMessage('Failed to minify selection. See output for more info.');
                    if (config.showLogOnError) {
                        output.show();
                    }
                }
                break;
            }

            default: {
                vscode.window.showErrorMessage('Language not supported.');
                break;
            }

        }

}
