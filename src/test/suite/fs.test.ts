import { File, DataFormat } from '../../fs';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { EXT_ID } from '../../utils';
import { EXT_ROOT } from './test_utils';

suite('File class', () => {

    test('Open file', () => {

        assert.doesNotThrow(() => {

            const packagePath = path.join(EXT_ROOT, 'package.json');
            // tslint:disable-next-line:no-unused-expression
            new File(packagePath).read();

        });

    });

    test('Read file', () => {

        const packagePath = path.join(EXT_ROOT, 'package.json');
        const data = new File(packagePath).read();

        assert.strictEqual(typeof data, 'string');
        assert.ok(data.length > 0);

    });

    test('Parse file', () => {

        const packagePath = path.join(EXT_ROOT, 'package.json');
        const data = new File(packagePath).parse(DataFormat.json);

        assert.ok(data);
        assert.strictEqual(typeof data, 'object');
        assert.strictEqual(data.name, EXT_ID);

    });

    test('File exists', () => {

        const packagePath = path.join(EXT_ROOT, 'package.json');
        const exists = new File(packagePath).exists();

        assert.equal(exists, true);

    });

    test('File does not exists', () => {

        const exists = new File('this_file_does_not_exist').exists();

        assert.equal(exists, false);

    });

    test('Write file', () => {

        const filePath = path.join(EXT_ROOT, '.ignoreme');
        const data ='this is a test';
        const file = new File(filePath);
        file.write(data);

        assert.strictEqual(fs.existsSync(filePath), true);
        assert.strictEqual(fs.readFileSync(filePath, 'utf8'), data);
        fs.unlinkSync(filePath);

    });

    test('Throw is file does not exist', () => {

        assert.throws(() => {

            // tslint:disable-next-line:no-unused-expression
            new File('path/to/file/that/does/not/exist').read();

        });

    });

});
