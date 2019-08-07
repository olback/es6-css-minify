import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { EXT_ID } from '../../utils';
import { config, reloadConfig } from '../../config';
import { File, DataFormat } from '../../fs';
import { WORKSPACE_PATH } from './test_utils';

interface IndexSignature {
    [key: string]: any;
}

suite('Conifg class', () => {

    test('Config matches package.json', () => {

        const ext = vscode.extensions.getExtension(`olback.${EXT_ID}`) as vscode.Extension<any>;

        const packageConfigStructure: IndexSignature = {};

        for (const p in ext.packageJSON.contributes.configuration.properties) {
            const property = p.replace(`${EXT_ID}.`, '');
            packageConfigStructure[property] = ext.packageJSON.contributes.configuration.properties[p].type;
        }

        // Make sure all settings in package.json are included in the class.
        for (const p in packageConfigStructure) {
            assert.strictEqual(
                typeof (config as IndexSignature)[p],
                packageConfigStructure[p],
                `Found property "${p}" in package.json but it does not exist in class`
            );
        }

        // Make sure there are no extra properties in the class.
        for (const p in (config as IndexSignature)) {
            assert.strictEqual(
                typeof (config as IndexSignature)[p],
                packageConfigStructure[p],
                `Found property "${p}" in class but it does not exist in package.json`
            );
        }

    });

    test('Parse .uglifyrc', () => {

        const uglifyrc = new File(path.join(WORKSPACE_PATH, config.uglifyConfigFile)).parse(DataFormat.json);
        reloadConfig(true);

        // Since we modify the js object after its been parsed, delete it from both the parsed file and the config.
        delete uglifyrc.sourceMap;
        delete config.js.sourceMap;

        assert.deepStrictEqual(uglifyrc, config.js);

    });


    test('Parse .cleancssrc', () => {

        const cleancssrc = new File(path.join(WORKSPACE_PATH, config.cleancssConfigFile)).parse(DataFormat.json);
        reloadConfig(true);

        // Since we modify the css object after its been parsed, delete it from both the parsed file and the config.
        delete cleancssrc.sourceMap;
        delete config.css.sourceMap;

        assert.deepStrictEqual(cleancssrc, config.css);

    });

    test('config.js defaults is correct', () => {

        reloadConfig(false);

        const defaultJs = {
            mangle: false,
            compress: {
                unused: false
            },
            output: {
                quote_style: 0
            },
            sourceMap: true
        };

        assert.deepStrictEqual(config.js, defaultJs);

    });

    test('config.css defaults is correct', () => {

        reloadConfig(false);

        const defaultCss = {
            rebase: false,
            sourceMap: true
        };

        assert.deepStrictEqual(config.css, defaultCss);

    });

});

