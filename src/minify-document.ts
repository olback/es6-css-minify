import * as vscode from 'vscode';
import * as path from 'path';
import { Config } from './config';
import { output } from './output';
import { CssMinifier } from './css';
import { EsMinifier } from './js';
import { JsonMinifier } from './json';

export function minifyDocument(doc: vscode.TextDocument, config: Config) {

    switch (doc.languageId) {

        case 'css': {
            break;
        }

        case 'javascript': {
            break;
        }

        default: {
            vscode.window.showErrorMessage('Language not supported.');
        }

    }

}
