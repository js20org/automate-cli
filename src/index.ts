import {
    runBuildRelease,
    runCommit,
    runInstall,
    runNew,
    runRelease,
    runUpgrade,
} from './commands';

import { Environment } from './environment';
import { DefaultLogger } from './logger';
import { ICommand } from './types';
import { handleArgs, handleError } from './utils';

const commands: ICommand[] = [
    {
        subcommand: 'build-release',
        description: 'Installs an existing release to the repository.',
        run: runBuildRelease,
    },
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
    {
        subcommand: 'upgrade',
        description: 'Upgrades emp packages used in this project.',
        run: runUpgrade,
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
