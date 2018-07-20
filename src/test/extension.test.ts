//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as vscode from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

const ex = 'es6-css-minify';

// Defines a Mocha test suite to group tests of similar kind together
suite("JS & CSS Minifier: Extension Tests", () => {
    test("Extension loaded", () => {
        assert.ok(vscode.extensions.getExtension("olback.es6-css-minify"));
    });

    // The extension is already activated by vscode before running mocha test framework.
    // No need to test activate any more. So commenting this case.
    // tslint:disable-next-line: only-arrow-functions
    // test("should be able to activate the extension", function(done) {
    //     this.timeout(60 * 1000);
    //     const extension = vscode.extensions.getExtension("vsciot-vscode.vscode-arduino");
    //     if (!extension.isActive) {
    //         extension.activate().then((api) => {
    //             done();
    //         }, () => {
    //             done("Failed to activate extension");
    //         });
    //     } else {
    //         done();
    //     }
    // });

    test('Commands registered', () => {
            return vscode.commands.getCommands(true).then((commands) => {
                const JS_CSS_MINIFY_COMMANDS = [
                    `${ex}.reloadConfig`,
                    `${ex}.minify`,
                ];

                const foundMinifierCommands = commands.filter((value) => {
                    return JS_CSS_MINIFY_COMMANDS.indexOf(value) >= 0 || value.startsWith(`${ex}.`);
                });

                const errorMsg = "Some Minifier commands are not registered properly or a new command is not added to the test";
                assert.equal(foundMinifierCommands.length, JS_CSS_MINIFY_COMMANDS.length, errorMsg);
            });
        });

});
