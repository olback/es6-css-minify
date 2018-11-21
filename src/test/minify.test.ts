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
        setTimeout(() => {
            assert.equal(fs.existsSync(minjsp), true, 'Minified file does not exist');
        }, 50);

    });

    test('Minify Javascript (default settings, syntax errors)', async () => {

        const uri = vscode.Uri.file(path.join(WORKSPACE_PATH, 'js', 'syntax.error.js'));
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        await vscode.commands.executeCommand(`${ex}.minify`);

        const minjsp = path.join(WORKSPACE_PATH, 'js', 'syntax.error.min.js');
        setTimeout(() => {
            assert.notEqual(fs.existsSync(minjsp), true, 'Minified file does not exist');
        }, 50);

    });

    test('Minify CSS (new path, new postfix)', async () => {

        const uri = vscode.Uri.file(path.join(WORKSPACE_PATH, 'css', 'main.css'));
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        await vscode.commands.executeCommand(`${ex}.minify`);

        const mincssp = path.join(WORKSPACE_PATH, 'dist', 'css', 'main.minified.css');
        console.log(mincssp);
        setTimeout(() => {
            assert.equal(fs.existsSync(mincssp), true, 'Minified file does not exist');
        }, 50);

    });

});
