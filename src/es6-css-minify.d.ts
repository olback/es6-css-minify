type MinifyOutput = MinifySuccess | MinifyError;

interface MinifySuccess {
    success: true;
    efficiency: number;
    warnings: string[];
    errors: string[];
    output: {
        code: string;
        map: string;
    };
}

interface MinifyError {
    success: false;
    warnings: string[];
    errors: string[];
}
