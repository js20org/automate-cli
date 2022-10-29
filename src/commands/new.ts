import path from 'path';

import {
    CommandExecutorService,
    FilesystemService,
    runGenerator,
} from 'rjsv-templates';

import { hasFile } from '../utils';
import { ILogger } from '../types';

const getRootPath = () => {
    const devPath = path.resolve(
        __dirname,
        '..',
        'node_modules/rjsv-templates/files'
    );

    const hasDev = hasFile(devPath);

    if (hasDev) {
        return devPath;
    }

    const prodPath = path.resolve(__dirname, '../..', 'rjsv-templates/files');
    const hasProd = hasFile(prodPath);

    if (hasProd) {
        return prodPath;
    }

    throw new Error('Failed to find rjsv-templates files.');
};

export const runNew = async (_logger: ILogger) => {
    const workingDirectory = process.cwd();
    const filesRootPath = getRootPath();

    await runGenerator(
        filesRootPath,
        new FilesystemService(workingDirectory, false),
        new CommandExecutorService(workingDirectory)
    );
};
