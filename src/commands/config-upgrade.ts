import path from 'path';

import { FilesystemService, runUpdateBaseFiles } from '@empiriska/templates';
import { ILogger, fontBright, fontDim } from '@empiriska/js-common-backend';

import {
    assertGitBranchUpToDate,
    assertIsOnGitBranch,
    createGitCommit,
    CustomOption,
    CwdMover,
    getAllOwnPackageJson,
    getOption,
    hasGitChanges,
    IPackageInfo,
    pushEmpiriskaGitBranch,
} from '../actions';

const COMMIT_PREFIX = '[config-upgrade] ';

const commitChanges = async (logger: ILogger) => {
    try {
        await assertIsOnGitBranch(logger, 'master');
        await assertGitBranchUpToDate(logger);

        const commitFiles = ['config'];
        const commitMessage = `${COMMIT_PREFIX}- Automatically upgraded configs`;

        await createGitCommit(logger, commitFiles, commitMessage);
        await pushEmpiriskaGitBranch(logger, 'master');

        logger.log(fontDim('Commited config upgrade!'));
    } catch (e) {
        logger.log(
            fontDim(
                'No commit made because repo was not on the master branch or outdated'
            )
        );
    }
};

const upgradeConfig = async (logger: ILogger, rootDir: string, packageInfo: IPackageInfo) => {
    const type = getOption(
        logger,
        packageInfo.path,
        packageInfo.content,
        CustomOption.TYPE
    );

    const filesystemService = new FilesystemService(rootDir, true);
    const filesRootPath = path.resolve(__dirname, '..', 'node_modules/@empiriska/templates/files');

    runUpdateBaseFiles(filesRootPath, filesystemService, type);

    return await hasGitChanges(logger);
};

export const runConfigUpgrade = async (logger: ILogger) => {
    const packagesInDirectory = await getAllOwnPackageJson(logger);

    logger.log('Updating configs in all repositories...');
    logger.log('');

    for (const packageMatch of packagesInDirectory) {
        const cwdMover = new CwdMover();
        cwdMover.moveTo(packageMatch.directoryPath);

        const hasLocalChanges = await hasGitChanges(logger);
        logger.log(`Upgrading ${fontBright(packageMatch.name)}...`);

        const didUpgradeConfigs = await upgradeConfig(logger, packageMatch.directoryPath, packageMatch);

        if (didUpgradeConfigs) {
            if (hasLocalChanges) {
                logger.log(
                    fontDim('No commit made because repo has local changes')
                );
            } else {
                await commitChanges(logger);
            }
        } else {
            logger.log('Nothing to upgrade 👍');
        }

        logger.log('');
        cwdMover.moveToOriginal();
    }

    logger.log('🎉 All packages have been upgraded.');
};
