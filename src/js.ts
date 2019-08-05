import * as terser from 'terser';
import * as path from 'path';
import { efficiency } from './utils';

export class EsMinifier {

    constructor(private options: terser.MinifyOptions) { }

    minify(input: string, fileName: string | null, jsMapSource: string): MinifyOutput {

        const local: terser.MinifyOptions = JSON.parse(JSON.stringify(this.options));

        if (this.options.sourceMap && fileName !== null) {
            local.sourceMap = {
                filename: jsMapSource ? path.join(jsMapSource, fileName) : fileName,
                url: `${fileName}.map`
            };
        }

        const output = terser.minify(fileName ? { [fileName]: input } : input, local);

        if (output.error) {

            return {
                success: false,
                warnings: [],
                errors: [output.error.message]
            };

        } else if (!output.code) {

            const warnings = ['Output is 0 bytes!'].concat(output.warnings || []);

            return {
                success: true,
                efficiency: efficiency(input.length, 0),
                warnings: warnings,
                errors: [],
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
                errors: [],
                output: {
                    code: output.code,
                    map: output.map ? output.map : ''
                }
            };

        }

    }

}
