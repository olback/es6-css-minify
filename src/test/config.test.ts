'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, ex } from '../extension';
import { WORKSPACE_PATH } from './tests_config';

suite('Config tests', () => {

    test('Config loading OK', () => {

        const config = loadConfig({
            showMessage: false,
            loadExternal: false,
            setGlobal: false
        });

        assert.deepStrictEqual(config, JSON.parse(JSON.stringify(vscode.workspace.getConfiguration(ex))));

    });

    test('Load uglifyrc config', () => {

        const config = loadConfig({
            showMessage: false,
            loadExternal: true,
            setGlobal: false
        });

        const uglifyrc = JSON.parse(fs.readFileSync(path.join(WORKSPACE_PATH, '.uglifyrc'), 'utf8'));

        assert.deepStrictEqual(config.js, uglifyrc);

    });

    test('Load cleancssrc config', () => {

        const config = loadConfig({
            showMessage: false,
            loadExternal: true,
            setGlobal: false
        });

        const cleancssrc = JSON.parse(fs.readFileSync(path.join(WORKSPACE_PATH, '.cleancssrc'), 'utf8'));

        assert.deepStrictEqual(config.css, cleancssrc);

    });

});
