// import { TextDocument } from 'vscode';
// import { Config } from './config';

export const EXT_ID = 'es6-css-minify';
export const SUPPORTED_FILES = [
    'javascript',
    'css'
];

export function efficiency(original: number, minified: number): number {
    return original === 0 ? 0 : Number((100 - ((minified / original) * 100)).toFixed(2));
}

// export function getOutPath(doc: TextDocument, config: Config): string {
// }
