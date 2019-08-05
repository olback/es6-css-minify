import { efficiency } from './utils';

export class JsonMinifier {

    // constructor(options: null = null) { }

    minify(input: string): MinifyOutput {

        try {

            const output = JSON.stringify(JSON.parse(input));

            return {
                success: true,
                efficiency: efficiency(input.length, output.length),
                warnings: [],
                errors: [],
                output: {
                    code: output,
                    map: ''
                }
            };

        } catch (e) {

            console.error(e);

            return {
                success: false,
                warnings: [],
                errors: [e.message]
            };

        }

    }

}