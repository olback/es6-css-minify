import * as assert from 'assert';
import * as vscode from 'vscode';
import { EXT_ID } from '../../utils';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {

    test('Extension loaded by VS Code', () => {

        assert.ok(vscode.extensions.getExtension(`olback.${EXT_ID}`));

    });

    test('All commands registerd', async () => {

        const allRegisterdCommands = await vscode.commands.getCommands(true);
        const foundRegisterdExtCommands = allRegisterdCommands.filter(v => v.includes(EXT_ID));
        // @ts-ignore
        const commandsFromPackageJson = vscode.extensions.getExtension(`olback.${EXT_ID}`).packageJSON.contributes.commands.map((v: any) => v.command);

        assert.deepEqual(
            foundRegisterdExtCommands,
            commandsFromPackageJson,
            'Registerd commands does not match package.json'
        );

    });

});
