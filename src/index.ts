import { DefaultLogger, handleError } from '@js20/node-utils';

import {
    runCommit,
    runNew,
    runTemplateSetup,
} from './commands';

import { ICommand } from './types';
import { handleArgs } from './utils';

const commands: ICommand[] = [
    {
        subcommand: 'commit',
        description: 'Assists in making a commit.',
        run: runCommit,
    },
    {
        subcommand: 'new',
        description: 'Generates a new project template.',
        run: runNew,
    },
    {
        subcommand: 'template-setup',
        description: 'Setup a new root directory for your project templates.',
        run: runTemplateSetup,
    },
];

const run = async () => {
    const shouldLogVerbose = process.argv.includes('--verbose');
    const logger = new DefaultLogger(shouldLogVerbose);

    try {
        await handleArgs(logger, commands);
    } catch (e) {
        handleError(logger, e as Error);
    }
};

run();
