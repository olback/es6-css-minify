import * as cleancss from 'clean-css';
import * as autoprefixer from 'autoprefixer';
import { efficiency } from './utils';

interface CssInputFile {
    file: string;
    data: string;
}

export class CssMinifier {

    constructor(private options: cleancss.Options, private ap: { use: boolean, options: autoprefixer.Options }) { }

    minify(_input: string | CssInputFile): MinifyOutput {

        const cssInputStr = typeof _input === 'string' ? _input : _input.data;

        let css: string;

        if (this.ap.use) {

            try {

                css = autoprefixer.process(cssInputStr, this.ap.options).toString();

            } catch (e) {

                return {
                    success: false,
                    warnings: [],
                    errors: [
                        // 'Autoprefixer failed to parse CSS. Probaly due to an syntax error.',
                         e.message
                    ]
                };

            }

        } else {

            css = cssInputStr;

        }

        const output = new cleancss(this.options as cleancss.OptionsOutput)
        // .minify(css);
        .minify(typeof _input === 'string' ? css : { [_input.file]: { styles: css } })

        console.log(output);

        if (output.errors.length > 0) {

            return {
                success: false,
                warnings: output.warnings,
                errors: output.errors
            };

        } else if (output.styles.trim().length === 0) {

            const warnings = ['Output is 0 bytes!'].concat(output.warnings);

            return {
                success: true,
                efficiency: efficiency(output.stats.originalSize, output.stats.minifiedSize),
                warnings: warnings,
                errors: output.errors,
                output: {
                    code: output.styles,
                    map: output.sourceMap
                }
            };

        } else {

            return {
                success: true,
                efficiency: efficiency(output.stats.originalSize, output.stats.minifiedSize),
                warnings: output.warnings,
                errors: output.errors,
                output: {
                    code: output.styles,
                    map: output.sourceMap
                }
            };

        }

    }

}
