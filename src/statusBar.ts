import * as vscode from 'vscode';
import { EXT_ID } from './utils';

export class StatusBar {

    private _button: vscode.StatusBarItem;

    constructor() {
        this._button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this._button.text = '$(fold) Minify';
        this._button.command = `${EXT_ID}.minify`;
        this._button.tooltip = 'Minify current file.';
    }

    showButton() {

        this._button.show();

    }

    hideButton() {

        this._button.hide();

    }

    showMessage(str: string, timeout = 3) {
        vscode.window.setStatusBarMessage(`$(graph) ${str}`, timeout);
    }

}
