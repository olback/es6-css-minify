import * as fs from 'fs';
import * as path from 'path';

interface Human {
    name: string;
    email?: string | undefined;
    url?: string | undefined;
};

interface GalleryBanner {
    color: string;
    theme: 'dark' | 'light';
}

interface Engine {
    vscode: string;
}

namespace Contributes {

    export namespace Commands {
        
        export interface Command {
            command: string;
            title: string;
        }

    }

    export interface Commands {
        commands: Array<Commands.Command>;
    }

    export interface Configuration {
        type: boolean | string | number | object | Array<string> | null;
        title: string;
        properties: any;
    }

}

interface Contributes {
    commands: Array<Contributes.Commands.Command>;
    configuration: Contributes.Configuration;
}

interface Package {
    name: string | undefined;
    displayName: string | undefined;
    description: string;
    version: string;
    publisher: string;
    icon: string;
    galleryBanner: GalleryBanner;
    license: string;
    author: Human;
    keywords: Array<string>;
    categories: Array<string>;
    engines: Engine;
    activationEvents: Array<string>;
    main: string;
    contributes: Contributes;
    scripts: any;
    devDependencies: any;
    dependencies: any;
};

export const pkg: Package = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
