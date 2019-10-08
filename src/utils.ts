import * as vscode from 'vscode';
import { config, reloadConfig } from './config';
import * as path from 'path';

export const EXT_ID = 'es6-css-minify';
export const SUPPORTED_FILES = [
    'javascript',
    'css'
];

export function isMinified(doc: vscode.TextDocument): boolean {
    const baseName = path.basename(doc.fileName);
    const postfix = baseName.split('.')[baseName.split('.').length - 2];
    return (doc.languageId === 'javascript' && postfix === config.jsPostfix) || (doc.languageId === 'css' && postfix === config.cssPostfix);
}

export function efficiency(original: number, minified: number): number {
    return original === 0 ? 0 : Number((100 - ((minified / original) * 100)).toFixed(2));
}

export function getOutPath(doc: vscode.TextDocument): string {

    const file = {
        basename: path.basename(doc.uri.fsPath),
        extname: path.extname(doc.uri.fsPath),
        dirname: path.dirname(doc.uri.fsPath),
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

function isConfigFile(path: string): boolean {

    return path.endsWith(config.uglifyConfigFile) || path.endsWith(config.cleancssConfigFile) || path.endsWith(config.autoprefixerConfigFile);

}

export function onConfigFileChange(uri: vscode.Uri) {

    if (isConfigFile(uri.path)) {

        reloadConfig(true);
        vscode.window.showInformationMessage('Minify configuration reloaded.');

    }

}



