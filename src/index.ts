import { runCommit, runInstall, runNew, runRelease } from './commands';
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
    {
        subcommand: 'install',
        description: 'Installs a package to the current project.',
        run: runInstall,
    },
    {
        subcommand: 'new',
        description: 'Generates a new project boilerplate.',
        run: runNew,
    },
    {
        subcommand: 'release',
        description: 'Releases a new version of your package.',
        run: runRelease,
    },
];

const run = async () => {
    const shouldLogVerbose = process.argv.includes('--verbose');
    const logger = new DefaultLogger(shouldLogVerbose);

    try {
        const environment = new Environment();

        await environment.initialize(logger);
        await handleArgs(logger, environment, commands);
    } catch (e) {
        handleError(logger, e);
    }
};

run();
