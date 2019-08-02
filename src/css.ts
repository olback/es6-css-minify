import * as cleancss from 'clean-css';
import autoprefixer = require('autoprefixer');

export class CssMinifier {

    constructor(private options: cleancss.Options, private ap: { use: boolean, options: autoprefixer.Options }) { }

    minify(input: string): MinifyOutput {

        let css: string;

        if (this.ap.use) {

            try {

                css = autoprefixer.process(input, this.ap.options).toString();

            } catch (e) {

                return {
                    success: false,
                    warnings: [],
                    erros: [
                        'Autoprefixer failed to parse CSS. Probaly due to an syntax error.',
                         e.message
                    ]
                };

            }

        } else {

            css = input;

        }

        const output = new cleancss(this.options as cleancss.OptionsOutput).minify(css);

        if (output.errors.length > 0) {

            return {
                success: false,
                warnings: output.warnings,
                erros: output.errors
            };

        } else if (output.styles.trim().length === 0) {

            const warnings: string[] = [];
            warnings.push('Output is 0 bytes!');
            warnings.concat(output.warnings);

            return {
                success: true,
                efficiency: output.stats.efficiency,
                warnings: warnings,
                erros: output.errors,
                output: {
                    code: output.styles,
                    map: output.sourceMap
                }
            };

        } else {

            return {
                success: true,
                efficiency: Number((output.stats.efficiency * 100).toFixed(2)),
                warnings: output.warnings,
                erros: output.errors,
                output: {
                    code: output.styles,
                    map: output.sourceMap
                }
            };

        }

    }

}
