import * as terser from 'terser';
import { efficiency } from './utils';

export class EsMinifier {

    constructor(private options: terser.MinifyOptions) { }

    minify(input: string, fileName: string): MinifyOutput {

        const output = terser.minify({
            [fileName]: input
        }, this.options);

        if (output.error) {

            return {
                success: false,
                warnings: [],
                erros: [output.error.message]
            };

        } else if (!output.code) {

            return {
                success: true,
                efficiency: efficiency(input.length, 0),
                warnings: output.warnings || [],
                erros: [],
                output: {
                    code: output.code ? output.code : '',
                    map: output.map ? output.map : ''
                }
            };

        } else {

            return {
                success: true,
                efficiency: efficiency(input.length, output.code.length),
                warnings: output.warnings || [],
                erros: [],
                output: {
                    code: output.code,
                    map: output.map ? output.map : ''
                }
            };

        }

    }

}
