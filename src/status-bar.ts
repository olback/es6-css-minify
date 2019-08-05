import * as vscode from 'vscode';
import { EXT_ID } from './utils';

class StatusBar {

    private _button: vscode.StatusBarItem;

    constructor() {
        this._button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this._button.text = '$(fold) Minify';
        this._button.command = `${EXT_ID}.minify`;
        this._button.tooltip = 'Minify current file.';
    }

    showButton(): void {

        this._button.show();

    }

    hideButton(): void {

        this._button.hide();

    }

    showStats(eff: number, timeout = 5000): void {
            vscode.window.setStatusBarMessage(`$(graph) Output is ${Math.abs(eff)}% ${eff < 0 ? 'bigger' : 'smaller' }.`, timeout);
    }

    showMessage(str: string, timeout = 5000): void {
        vscode.window.setStatusBarMessage(str, timeout);
    }

}

export const statusBar = new StatusBar();
