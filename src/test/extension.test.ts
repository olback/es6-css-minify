'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import { ex } from '../extension';

suite('JS & CSS Minifier: Extension Tests', () => {

    test('Extension loaded by VS Code', () => {
        assert.ok(vscode.extensions.getExtension(`olback.${ex}`));
    });

    test('Commands registered', () => {
        return vscode.commands.getCommands(true).then(commands => {
            const JS_CSS_MINIFY_COMMANDS = [
                `${ex}.reloadConfig`,
                `${ex}.minify`,
            ];

            const foundMinifierCommands = commands.filter(value => {
                return JS_CSS_MINIFY_COMMANDS.indexOf(value) >= 0 || value.startsWith(`${ex}.`);
            });

            const errorMsg = 'Some Minifier commands are not registered properly or a new command is not added to the test';
            assert.equal(foundMinifierCommands.length, JS_CSS_MINIFY_COMMANDS.length, errorMsg);
        });
    });

});
