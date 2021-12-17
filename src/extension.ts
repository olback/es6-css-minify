import * as vscode from 'vscode';
import { config, reloadConfig } from './config';
import { statusBar } from './status-bar';
import { EXT_ID, SUPPORTED_FILES, isMinified, getOutPath, onConfigFileChange } from './utils';
import { output } from './output';
import { File } from './fs';
import { minifyDocument } from './minify-document';
import { minifySelection } from './minify-selection';

export function activate(context: vscode.ExtensionContext): void {

    // Load config
    reloadConfig(true);


    // Show minify button
    if (config.hideButton === 'never' || config.hideButton === false) {
        statusBar.showButton();
    }


    // Commands
    context.subscriptions.push(

        // Reload config.
        vscode.commands.registerCommand(`${EXT_ID}.loadConfig`, () => {

            reloadConfig(true);
            if (config.hideButton === 'never') {
                statusBar.showButton();
            } else if (config.hideButton === 'always') {
                statusBar.hideButton();
            }
            vscode.window.showInformationMessage('Minify configuration reloaded.');

        }),


        // Minify file.
        vscode.commands.registerCommand(`${EXT_ID}.minify`, () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('No document open.');
                return;
            }

            if (editor.document.isUntitled) {
                vscode.window.showErrorMessage('File must be saved before it can be minified.');
                return;
            }

            minifyDocument(editor.document);

        }),

        
        // Minify file given a path ...
        vscode.commands.registerCommand( `${EXT_ID}.minifyFile`,  async ( file_path: string ) => {

            const uri = vscode.Uri.parse( file_path );
            
            if ( !uri ) {
            
                vscode.window.showErrorMessage( 'Invalid file path' );
        
                return;
                
            }
            
            if ( uri.scheme === 'file' && ( file.path.endsWith( '.js' ) || file.path.endsWith( '.css') ) ) {

               const doc = await vscode.workspace.openTextDocument( uri );
                
               if ( !doc ) {

                   vscode.window.showErrorMessage( 'File not found in workspace' );
        
                   return;
                   
               }
               
               minifyDocument( doc );
               
            }
            else {
                   
               vscode.window.showErrorMessage( 'File URI scheme is not "file" or file path does not end in .js or .css' );
        
               return; 
        
            }
                                        
        }),

        // Minify selection.
        vscode.commands.registerCommand(`${EXT_ID}.minifySelection`, () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('No editor open.');
                return;
            }

            minifySelection(editor);

        }),


        // Minify document from explorer
        vscode.commands.registerCommand(`${EXT_ID}.minifyExplorer`, async (f: vscode.Uri | undefined) => {

            // If f is undefined, show file picker
            const uri: vscode.Uri | null = f instanceof vscode.Uri ? f : await (async () => {

                const allFiles = await vscode.workspace.findFiles('**/*');
                const files = allFiles.filter(file => {

                    return file.scheme === 'file' && (file.path.endsWith('.js') || file.path.endsWith('.css'));

                });

                if (files.length === 0) {
                    vscode.window.showInformationMessage('No files available to minify');
                    return null;
                }

                const filesRelative = files.map(file => {
                    return vscode.workspace.asRelativePath(file.path);
                });

                const pick = await vscode.window.showQuickPick(filesRelative);
                // console.log('pick', pick);
                if (!pick) {
                    return null;
                }

                return files[filesRelative.indexOf(pick)];

            })();

            if (uri) {
                const doc = await vscode.workspace.openTextDocument(uri);
                minifyDocument(doc);
            }

        }),


        // Export config for easy debug.
        vscode.commands.registerCommand(`${EXT_ID}.exportConfig`, () => {

            vscode.workspace.openTextDocument({ language: 'json', content: JSON.stringify(config, null, 4)})
            .then(doc => {
                vscode.window.showTextDocument(doc);
            });

        }),


        // Minify on save.
        vscode.workspace.onDidSaveTextDocument(doc => {

            if (config.minifyOnSave === false || config.minifyOnSave === 'no' || !SUPPORTED_FILES.includes(doc.languageId)) {
                return;
            }

            if (config.minifyOnSave === 'exists') {
                if (!new File(getOutPath(doc)).exists()) {
                    return;
                }
            }

            // This is a hack to get arround bad/old hardware.
            if (config.onSaveDelay) {
                setTimeout(() => {
                    minifyDocument(doc);
                }, config.onSaveDelay);
            } else {
                minifyDocument(doc);
            }

        }),


        // Hide the minify button unless the active document is a non-minified JS/CSS file.
        vscode.workspace.onDidOpenTextDocument(() => {

            if (vscode.window.activeTextEditor && (config.hideButton === 'auto' || config.hideButton === true)) {
                const doc = vscode.window.activeTextEditor.document;
                if (SUPPORTED_FILES.includes(doc.languageId) && !isMinified(doc)) {
                    statusBar.showButton();
                } else {
                    statusBar.hideButton();
                }
            }

        }),


        // Reload minify config if the vscode config is modified
        vscode.workspace.onDidChangeConfiguration(e => {

            if (e.affectsConfiguration(EXT_ID)) {

                reloadConfig(true);
                if (config.hideButton === 'never') {
                    statusBar.showButton();
                } else if (config.hideButton === 'always') {
                    statusBar.hideButton();
                }
                vscode.window.showInformationMessage('Minify configuration reloaded.');

            }

        })

    );


    const watcher = vscode.workspace.createFileSystemWatcher('**', false, false, false)
    watcher.onDidCreate(onConfigFileChange);
    watcher.onDidChange(onConfigFileChange);
    watcher.onDidDelete(onConfigFileChange);

    context.subscriptions.push(watcher);

    console.log('es6-css-minify 3 is now active!');

}

export function deactivate(): void {
    output.dispose();
}
