import {
    runCommit,
    runCustomerVersion,
    runInstall,
    runNew,
    runRelease,
    runReleaseLocal,
    runStatus,
    runUpgrade,
    runVerify,
} from './commands';

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
        subcommand: 'customer-version',
        description:
            'Versions a package and lets you specify what to enter in the changelog.',
        run: runCustomerVersion,
    },
    {
        subcommand: 'install',
        description: 'Installs a local package to the current project.',
        run: runInstall,
    },
    {
        subcommand: 'new',
        description: 'Generates a new project.',
        run: runNew,
    },
    {
        subcommand: 'release',
        description: 'Versions and releases a package.',
        run: runRelease,
    },
    {
        subcommand: 'release-local',
        description: 'Locally releases an existing package version.',
        run: runReleaseLocal,
    },
    {
        subcommand: 'status',
        description:
            'Checks the status of all the projects found in a recursive search.',
        run: runStatus,
    },
    {
        subcommand: 'upgrade',
        description:
            'Upgrades local packages for the projects found in a recursive search.',
        run: runUpgrade,
    },
    {
        subcommand: 'verify',
        description:
            'Verifies that a package is correctly configured and contains all necessary parts.',
        run: runVerify,
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
