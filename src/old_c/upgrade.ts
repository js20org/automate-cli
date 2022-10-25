import {
    assertGitBranchUpToDate,
    assertIsOnGitBranch,
    createGitCommit,
    CwdMover,
    moveAndFindAllOwnPackageJson,
    getAllOwnPackageJson,
    getVerifiedPackageJson,
    getExistingPackageVersion,
    getReleaseOverview,
    getReleaseTargetFilePath,
    hasGitChanges,
    hasNewMajorVersion,
    IPackageInfo,
    promptForNewMajor,
    pushGitBranch,
    runYarnInstall,
    updateDependency,
} from '../actions';

import { ILogger, IReleaseOverview, IReleaseOverviewPackage } from '../types';
import { fontBright, fontDim, fontGreen } from '../utils';

const COMMIT_PREFIX = '[dependency-upgrade] ';

const upgradeIfPackageExists = async (
    logger: ILogger,
    releaseOverviewPackage: IReleaseOverviewPackage,
    packageJsonContent: Record<string, any>,
    packageJsonPath: string,
    allPackages: IPackageInfo[]
) => {
    const { name: packageName, latestVersion } = releaseOverviewPackage;
    const { type: dependencyType, version: existingVersion } =
        getExistingPackageVersion(packageJsonContent, packageName);

    const shouldUpgrade = existingVersion && existingVersion !== latestVersion;

    if (!shouldUpgrade) {
        return false;
    }

    const hasNewMajor = hasNewMajorVersion(latestVersion, existingVersion);

    if (hasNewMajor) {
        await promptForNewMajor(
            logger,
            allPackages,
            packageName,
            latestVersion,
            existingVersion
        );
    }

    const targetPath = getReleaseTargetFilePath(packageName, latestVersion);

    updateDependency(
        packageJsonContent,
        packageJsonPath,
        dependencyType,
        packageName,
        targetPath
    );

    return true;
};

const commitChanges = async (logger: ILogger) => {
    try {
        await assertIsOnGitBranch(logger, 'master');
        await assertGitBranchUpToDate(logger);

        const commitFiles = ['yarn.lock', 'package.json'];
        const commitMessage = `${COMMIT_PREFIX}- Automatically upgraded package versions`;

        await createGitCommit(logger, commitFiles, commitMessage);
        await pushGitBranch(logger, 'master');

        logger.log(fontDim('Commited upgrade!'));
    } catch (e) {
        logger.log(
            fontDim(
                'No commit made because repo was not on the master branch or outdated'
            )
        );
    }
};

const upgradeLocal = async (
    logger: ILogger,
    packageJsonPath: string,
    releaseOverview: IReleaseOverview,
    packages: IPackageInfo[]
) => {
    const { packages: releaseOverviewPackages = [] } = releaseOverview;
    const packageJsonContent = getVerifiedPackageJson(logger, packageJsonPath);

    let didUpgradeAny = false;

    for (const overviewPackage of releaseOverviewPackages) {
        const didUpgrade = await upgradeIfPackageExists(
            logger,
            overviewPackage,
            packageJsonContent,
            packageJsonPath,
            packages
        );

        if (didUpgrade) {
            const packageName = fontGreen(overviewPackage.name);
            const newVersion = fontGreen(overviewPackage.latestVersion);

            logger.log(
                `✓ Upgraded package "${packageName}" to version "${newVersion}"`
            );

            didUpgradeAny = true;
        }
    }

    return didUpgradeAny;
};

export const runUpgrade = async (logger: ILogger) => {
    const allPackages = await moveAndFindAllOwnPackageJson(logger);
    const packagesInDirectory = await getAllOwnPackageJson(logger);

    const releaseOverview = getReleaseOverview();

    logger.log('Upgrading all repositories...');
    logger.log('');

    for (const packageMatch of packagesInDirectory) {
        const cwdMover = new CwdMover();
        cwdMover.moveTo(packageMatch.directoryPath);

        const hasLocalChanges = await hasGitChanges(logger);
        logger.log(`Upgrading ${fontBright(packageMatch.name)}...`);

        const didUpgradeAny = await upgradeLocal(
            logger,
            packageMatch.path,
            releaseOverview,
            allPackages
        );

        if (didUpgradeAny) {
            await runYarnInstall(logger);

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
