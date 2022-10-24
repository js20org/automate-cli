import {
    askForBoolean,
    askForOption,
    askForString,
    fontDim,
    fontUnderscore,
    ILogger,
} from '@empiriska/js-common-backend';

import {
    addAllGitFiles,
    getCurrentGitBranch,
    getGitChanges,
    gitCheckoutBranch,
    gitCheckoutNewBranch,
    hasGitChanges,
    openBrowserWindow,
    performGitCommitAll,
    pushEmpiriskaGitBranch,
} from '../actions';

const pushToNewBranch = async (logger: ILogger, message: string) => {
    const branchName = await askForString('Enter branch name: feature/');
    const fullBranchName = `feature/${branchName}`;

    await gitCheckoutNewBranch(logger, fullBranchName);
    await performGitCommitAll(logger, message);
    
    const pullRequestUrl = await pushEmpiriskaGitBranch(logger, fullBranchName);
    const shouldCreatePullRequest = await askForBoolean('Create pull request?', true);

    if (shouldCreatePullRequest) {
        await openBrowserWindow(logger, pullRequestUrl);
    }

    const shouldReturn = await askForBoolean('Return to master?', true);

    if (shouldReturn) {
        await gitCheckoutBranch(logger, 'master');
    }

    return fullBranchName;
};

const interactiveCommit = async (logger: ILogger) => {
    await addAllGitFiles(logger);

    const changes = await getGitChanges(logger);
    const currentBranch = await getCurrentGitBranch(logger);

    logger.log('');
    logger.log(`${fontUnderscore('Changes')}:\n${fontDim(changes)}`);

    const shouldCommit = await askForBoolean('Do you want to continue?', true);

    if (!shouldCommit) {
        throw new Error('Aborting because of user decision.');
    }

    const message = await askForString('Enter commit message:');

    const optionNone = 'No';
    const optionCurrentBranch = `Yes, to current branch (${currentBranch})`;
    const optionNewBranch = 'Yes, to new branch';

    const options = [optionNone, optionCurrentBranch, optionNewBranch];

    const selectedOption = await askForOption('Do you want to push?', options);

    const shouldPushToNew = selectedOption === optionNewBranch;
    const shouldPushToCurrent = selectedOption === optionCurrentBranch;

    if (shouldPushToNew) {
        const newBranchName = await pushToNewBranch(logger, message);

        logger.log(
            `✅ The commit was created and pushed to new branch "${newBranchName}".`
        );
    } else if (shouldPushToCurrent) {
        await performGitCommitAll(logger, message);
        await pushEmpiriskaGitBranch(logger, currentBranch);

        logger.log(
            `✅ The commit was created and pushed to "${currentBranch}".`
        );
    } else {
        await performGitCommitAll(logger, message);
        logger.log('✅ The commit was created.');
    }
};

export const runCommit = async (logger: ILogger) => {
    const hasChanges = await hasGitChanges(logger);

    if (!hasChanges) {
        return logger.log('No changes to commit.');
    }

    await interactiveCommit(logger);
};
