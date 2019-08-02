import * as terser from 'terser';
import * as cleancss from 'clean-css';
import * as autoprefixer from 'autoprefixer';
import * as vscode from 'vscode';
import * as path from 'path';
import { EXT_ID } from './utils';
import { File, DataFormat } from './fs';

export class Config {

    // General
    minifyOnSave: boolean | "yes" | "no" | "exists";
    hideButton: boolean;

    // Terser
    uglifyConfigFile: string;
    genJSmap: boolean;
    jsMapSource: string;
    jsMinPath: string;
    jsPostfix: string;
    js: terser.MinifyOptions;

    // Clean-css
    cleancssConfigFile: string;
    genCSSmap: boolean;
    cssMapSource: string;
    cssMinPath: string;
    cssPostfix: string;
    css: cleancss.Options;

    // Autoprefixer
    enableAutoprefixer: boolean;
    autoprefixer: autoprefixer.Options;
    autoprefixerConfigFile: string;

    constructor(external = true) {

        const conf = JSON.parse(JSON.stringify(vscode.workspace.getConfiguration(EXT_ID)));

        // General
        this.minifyOnSave = conf.minifyOnSave;
        this.hideButton = conf.hideButton;

        // Terser
        this.uglifyConfigFile = conf.uglifyConfigFile;
        this.genJSmap = conf.genJSmap;
        this.jsMapSource = conf.jsMapSource;
        this.jsMinPath =conf.jsMinPath;
        this.jsPostfix =conf.jsPostfix;
        this.js =conf.js;

        // Clean-css
        this.cleancssConfigFile = conf.cleancssConfigFile;
        this.genCSSmap = conf.genCSSmap;
        this.cssMapSource = conf.cssMapSource;
        this.cssMinPath = conf.cssMinPath;
        this.cssPostfix = conf.cssPostfix;
        this.css = conf.css;

        // Autoprefixer
        this.enableAutoprefixer = conf.enableAutoprefixer;
        this.autoprefixer = conf.autoprefixer;
        this.autoprefixerConfigFile = conf.autoprefixerConfigFile;

        if (external && vscode.workspace.workspaceFolders) {

            // Check if custom uglify/terser config exists and load it
            const jsrc = new File(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, this.uglifyConfigFile));
            if (jsrc.exists()) {
                let data = jsrc.parse(DataFormat.json);
                if (data && typeof data === 'object') {
                    this.js = data;
                } else {
                    console.error('Invalid uglifyrc file');
                    vscode.window.showWarningMessage('Invalid uglify/terser configuration. This is probably due to a syntax error.');
                }
            }

            // Check if custom clean-css config exists and load it
            const cssrc = new File(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, this.cleancssConfigFile));
            if (cssrc.exists()) {
                let data = cssrc.parse(DataFormat.json);
                if (data && typeof data === 'object') {
                    this.css = data;
                } else {
                    console.error('Invalid cleancssrc file');
                    vscode.window.showWarningMessage('Invalid clean-css configuration. This is probably due to a syntax error.');
                }
            }

            // Check if custom autoprefixer config exists and load it
            const aprc = new File(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, this.autoprefixerConfigFile));
            if (aprc.exists()) {
                let data = aprc.parse(DataFormat.json);
                if (data && typeof data === 'object') {
                    this.autoprefixer = data;
                } else {
                    console.error('Invalid autoprefixerrc file');
                    vscode.window.showWarningMessage('Invalid autoprefixer configuration. This is probably due to a syntax error.');
                }
            }

        } else {

            vscode.window.showWarningMessage('Not loading any custom configs since no workspace is open!');

        }

        // RegEx
        // This should no longer be needed since terser accepts strings as well as RegExp. Issue #57
        // if (
        //     typeof this.js.mangle === 'object' && this.js.mangle.properties &&
        //     typeof this.js.mangle.properties === 'object' && this.js.mangle.properties.regex
        // ) {
        //     this.js.mangle.properties.regex = new RegExp(this.js.mangle.properties.regex);
        // }

    }

}
