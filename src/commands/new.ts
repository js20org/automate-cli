import path from 'path';

import { ILogger } from '@empiriska/js-common-backend';
import {
    CommandExecutorService,
    FilesystemService,
    runGenerator,
} from '@empiriska/templates';

export const runNew = async (_logger: ILogger) => {
    const workingDirectory = process.cwd();
    const filesRootPath = path.resolve(__dirname, '..', 'node_modules/@empiriska/templates/files');

    await runGenerator(
        filesRootPath,
        new FilesystemService(workingDirectory, false),
        new CommandExecutorService(workingDirectory)
    );
};
