import {
    runBuildRelease,
    runCommit,
    runInstall,
    runNew,
    runRelease,
    runTemplateSetup,
    runUpgrade,
} from './commands';

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
        description: 'Generates a new project template.',
        run: runNew,
    },
    {
        subcommand: 'release',
        description: 'Releases a new version of your package.',
        run: runRelease,
    },
    {
        subcommand: 'template-setup',
        description: 'Setup a new root directory for your project templates.',
        run: runTemplateSetup,
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
        await handleArgs(logger, commands);
    } catch (e) {
        handleError(logger, e);
    }
};

run();
