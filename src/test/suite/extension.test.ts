import * as assert from 'assert';
import * as vscode from 'vscode';
import { EXT_ID } from '../../utils';

suite('Extension', () => {

    test('Extension loaded by VS Code', () => {

        assert.ok(vscode.extensions.getExtension(`olback.${EXT_ID}`));

    });

    test('All commands registerd', async () => {

        const allRegisterdCommands = await vscode.commands.getCommands(true);
        const foundRegisterdExtCommands = allRegisterdCommands.filter(v => v.includes(EXT_ID));
        const commandsFromPackageJson = (vscode.extensions.getExtension(`olback.${EXT_ID}`) as vscode.Extension<any>).packageJSON.contributes.commands.map((v: any) => v.command);

        assert.deepStrictEqual(
            foundRegisterdExtCommands,
            commandsFromPackageJson,
            'Registerd commands does not match package.json'
        );

    });

});
