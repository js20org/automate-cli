import { runCommit } from './commands';
import { Environment } from './environment';
import { DefaultLogger } from './logger';
import { ICommand } from './types';
import { handleArgs, handleError } from './utils';

const commands: ICommand[] = [
    {
        subcommand: 'commit',
        description: 'Assists in making a commit.',
        run: runCommit,
    },
];

const run = async () => {
    const shouldLogVerbose = process.argv.includes('--verbose');
    const logger = new DefaultLogger(shouldLogVerbose);

    try {
        const environment = new Environment();

        await environment.initialize(logger);
        await handleArgs(logger, commands);
    } catch (e) {
        handleError(logger, e);
    }
};

run();
