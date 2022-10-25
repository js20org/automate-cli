import path from 'path';

import { ILogger } from '../types';

import {
    CommandExecutorService,
    FilesystemService,
    runGenerator,
} from 'rjsv-templates';

export const runNew = async (_logger: ILogger) => {
    const workingDirectory = process.cwd();
    const filesRootPath = path.resolve(
        __dirname,
        '..',
        'node_modules/rjsv-templates/files'
    );

    await runGenerator(
        filesRootPath,
        new FilesystemService(workingDirectory, false),
        new CommandExecutorService(workingDirectory)
    );
};
