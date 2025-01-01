import { askForBoolean, fontDim, fontGreen, ILogger } from 'js-common-node';

import {
    assertGitBranchUpToDate,
    assertIsOnGitBranch,
    createGitCommit,
    getCwdPath,
    getDependencyRelativeFilePath,
    getExistingPackageVersion,
    getSelectedRegistry,
    getVerifiedPackageJson,
    hasGitChanges,
    hasNewMajorVersion,
    pushGitBranch,
    replaceDependencyFile,
    runNpmInstall,
    setPackageJsonDependency,
} from '../actions';

import { IEnvironment, IPackageVersion, IRegistry } from '../types';

const COMMIT_PREFIX = '[dependency-upgrade] ';

interface IUpgradeItem {
    newVersion: string;
    removedZipPath: string;
    addedZipPath: string;
}

const getSummary = (
    packageName: string,
    newVersion: string,
    breakingChangesArray: IPackageVersion[]
) => {
    const breakingChanges = breakingChangesArray
        .map((v) => fontDim(`${v.version} - ${v.breakingChangesDescription}`))
        .join('\n');

    return `
${packageName} - ${newVersion}

Breaking changes:
${breakingChanges}
`;
};

const promptForNewMajor = async (
    logger: ILogger,
    registry: IRegistry,
    packageName: string,
    latestVersion: string,
    existingVersion: string
) => {
    const breakingChanges = await registry.getBreakingChangesBetweenVersions(
        packageName,
        existingVersion,
        latestVersion
    );

    const summary = getSummary(packageName, latestVersion, breakingChanges);

    logger.log(summary);

    const shouldContinue = await askForBoolean('Do you want to continue?');

    if (!shouldContinue) {
        throw Error('Failed by user request.');
    }
};

const upgradeIfPackageExists = async (
    logger: ILogger,
    registry: IRegistry,
    packageJsonContent: Record<string, any>,
    packageJsonPath: string,
    packageName: string
): Promise<IUpgradeItem> => {
    const { type: dependencyType, version: existingVersion } =
        getExistingPackageVersion(packageJsonContent, packageName);

    if (!existingVersion) {
        return null;
    }

    const versionInfo = await registry.getPackageLatestVersion(packageName);

    const { version: latestVersion } = versionInfo;
    const shouldUpgrade = existingVersion !== latestVersion;

    if (!shouldUpgrade) {
        return null;
    }

    const hasNewMajor = hasNewMajorVersion(latestVersion, existingVersion);

    if (hasNewMajor) {
        await promptForNewMajor(
            logger,
            registry,
            packageName,
            latestVersion,
            existingVersion
        );
    }

    const { removedZipPath, addedZipPath } = await replaceDependencyFile(
        registry,
        versionInfo,
        existingVersion
    );

    const packageJsonTarget = getDependencyRelativeFilePath(
        versionInfo.fileName
    );

    setPackageJsonDependency(
        packageJsonContent,
        packageJsonPath,
        dependencyType,
        versionInfo.packageName,
        packageJsonTarget
    );

    return {
        newVersion: latestVersion,
        removedZipPath,
        addedZipPath,
    };
};

const performUpgrade = async (
    logger: ILogger,
    registry: IRegistry,
    packageJsonPath: string,
    packageJsonContent: Record<string, any>,
    allPackageNames: string[]
) => {
    const upgradeResult: IUpgradeItem[] = [];

    for (const packageName of allPackageNames) {
        const upgradeItem = await upgradeIfPackageExists(
            logger,
            registry,
            packageJsonContent,
            packageJsonPath,
            packageName
        );

        if (upgradeItem) {
            const formattedName = fontGreen(packageName);
            const formattedVersion = fontGreen(upgradeItem.newVersion);

            logger.log(
                `✓ Upgraded package "${formattedName}" to version "${formattedVersion}"`
            );

            upgradeResult.push(upgradeItem);
        }
    }

    return upgradeResult;
};

const commitChanges = async (logger: ILogger, upgradeItems: IUpgradeItem[]) => {
    try {
        await assertIsOnGitBranch(logger, 'main');
        await assertGitBranchUpToDate(logger);

        const upgradeFiles = upgradeItems
            .map((i) => [i.addedZipPath, i.removedZipPath])
            .flat(1)
            .filter((i) => !!i);

        const commitFiles = [...upgradeFiles, 'package.json', 'package-lock.json'];
        const commitMessage = `${COMMIT_PREFIX}- Automatically upgraded package versions`;

        await createGitCommit(logger, commitFiles, commitMessage);
        await pushGitBranch(logger, 'main');

        logger.log(fontDim('Commited upgrade!'));
    } catch (e) {
        logger.log(
            fontDim(
                'No commit made because repo was not on the main branch or outdated'
            )
        );
    }
};

export const runUpgrade = async (
    logger: ILogger,
    environment: IEnvironment
) => {
    logger.log('Upgrading all emp packages...');
    logger.log('');

    const hasLocalChanges = await hasGitChanges(logger);
    const registry = await getSelectedRegistry(environment);
    const packageNames = await registry.getAllPackageNames();

    const packageJsonPath = getCwdPath('package.json');
    const packageJsonContent = getVerifiedPackageJson(logger, packageJsonPath);

    const upgradeItems = await performUpgrade(
        logger,
        registry,
        packageJsonPath,
        packageJsonContent,
        packageNames
    );

    const didUpgradeAny = upgradeItems.length > 0;

    if (!didUpgradeAny) {
        return logger.log('Nothing to upgrade 👍');
    }

    await runNpmInstall(logger);

    if (hasLocalChanges) {
        logger.log(fontDim('No commit made because repo has local changes'));
    } else {
        await commitChanges(logger, upgradeItems);
    }
};
