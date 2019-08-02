export const EXT_ID = 'es6-css-minify';
export const SUPPORTED_FILES = [
    'javascript',
    'css'
];

export function efficiency(original: number, minified: number) {
    return original === 0 ? 0 : Number((100 - ((minified / original) * 100)).toFixed(2));
}
