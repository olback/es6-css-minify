import * as vscode from 'vscode';
import * as path from 'path';
import { config } from './config';
import { output } from './output';
import { CssMinifier } from './css';
import { EsMinifier } from './js';
import { isMinified, getOutPath } from './utils';
import { File } from './fs';
import { statusBar } from './status-bar';

export function minifyDocument(doc: vscode.TextDocument): void {

    const text = doc.getText();
    const baseName = path.basename(doc.fileName);

    if (isMinified(doc)) {
        // output.printMinifyResult(baseName, {
        //     success: false,
        //     warnings: [],
        //     errors: ['File already minified!']
        // });
        vscode.window.showErrorMessage('File already minified!');
        return;
    }

    // Minify
    switch (doc.languageId) {

        case 'css': {
            const minifier = new CssMinifier(config.css, { use: config.enableAutoprefixer, options: config.autoprefixer });
            const res = minifier.minify({
                file: doc.fileName,
                data: text
            });
            if (res.success) {
                try {
                    const outPath = getOutPath(doc);
                    if (config.genCSSmap) {
                        const map = JSON.parse(res.output.map);
                        map.sources = [config.cssMapSource ? path.join(config.cssMapSource, baseName) : baseName];
                        new File(`${outPath}.map`).write(JSON.stringify(map, null, 4));
                        res.output.code += `\n/*# sourceMappingURL=${path.basename(outPath)}.map */\n`;
                    }
                    new File(outPath).write(res.output.code);
                    statusBar.showStats(res.efficiency);
                    output.printMinifyResult(`${baseName}`, res);
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                } catch (e) {
                    vscode.window.showErrorMessage('Failed to write to file. Does the output path exist?');
                }
            } else if (config.showLogOnError) {
                output.printMinifyResult(`${baseName}`, res);
                output.show();
            } else {
                output.printMinifyResult(`${baseName}`, res);
            }
            break;
        }

        case 'javascript': {
            const outPath = getOutPath(doc);
            const minifier = new EsMinifier(config.js);
            const res = minifier.minify(text, baseName, {
                outFileName: path.basename(outPath),
                jsMapSource: config.jsMapSource
            });
            if (res.success) {
                try {
                    if (config.genJSmap) {
                        new File(`${outPath}.map`).write(res.output.map);
                    }
                    new File(outPath).write(res.output.code);
                    statusBar.showStats(res.efficiency);
                    output.printMinifyResult(`${baseName}`, res);
                    if (res.warnings.length && config.showLogOnWarning) {
                        output.show();
                    }
                } catch (e) {
                    vscode.window.showErrorMessage('Failed to write to file. Does the output path exist?');
                }
            } else if (config.showLogOnError) {
                output.printMinifyResult(`${baseName}`, res);
                output.show();
            } else {
                output.printMinifyResult(`${baseName}`, res);
            }
            break;
        }

        default: {
            vscode.window.showErrorMessage('Language not supported.');
            break;
        }

    }

}
