
import * as assert from 'assert';
import * as vscode from 'vscode';
import { pkg } from '../package.json';

// const ex = 'es6-css-minify';

suite('JS & CSS Minifier: Extension Tests', () => {

    test('Extension loaded by VS Code', () => {
        // assert.ok(vscode.extensions.getExtension('olback.es6-css-minify'));
        assert.ok(vscode.extensions.getExtension(`olback.${pkg.name}`));
    });

    test('Commands registered', () => {
        return vscode.commands.getCommands(true).then(commands => {
            const JS_CSS_MINIFY_COMMANDS = [
                `${pkg.name}.reloadConfig`,
                `${pkg.name}.minify`,
            ];

            const foundMinifierCommands = commands.filter(value => {
                return JS_CSS_MINIFY_COMMANDS.indexOf(value) >= 0 || value.startsWith(`${pkg.name}.`);
            });

            const errorMsg = 'Some Minifier commands are not registered properly or a new command is not added to the test';
            assert.equal(foundMinifierCommands.length, JS_CSS_MINIFY_COMMANDS.length, errorMsg);
        });
    });

});
