import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ex } from '../extension';
import { WORKSPACE_PATH } from './tests_config';

suite('Minfy Tests', () => {

    test('Minify Javascript (default settings)', async () => {

        const uri = vscode.Uri.file(path.join(WORKSPACE_PATH, 'js', 'aaa.main.js'));
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        await vscode.commands.executeCommand(`${ex}.minify`);

        const minjsp = path.join(WORKSPACE_PATH, 'js', 'aaa.main.min.js');
        assert.equal(fs.existsSync(minjsp), true, 'Minified file does not exist');

    });

    test('Minify CSS (new path, new postfix)', async () => {

        const uri = vscode.Uri.file(path.join(WORKSPACE_PATH, 'css', 'main.css'));
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        await vscode.commands.executeCommand(`${ex}.minify`);

        const minjsp = path.join(WORKSPACE_PATH, 'dist', 'css', 'main.minified.css');
        assert.equal(fs.existsSync(minjsp), true, 'Minified file does not exist');

    });

});
