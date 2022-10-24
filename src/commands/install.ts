import { askForOption, ILogger } from '@empiriska/js-common-backend';

import {
    getCwdPath,
    getEmpiriskaPackageJson,
    getReleaseOverview,
    getReleaseTargetFilePath,
    hasFile,
    runYarnInstall,
    getExistingPackageVersion,
    DependencyType,
    updateDependency,
    hasNewMajorVersion,
    getAllEmpiriskaPackages,
    promptForNewMajor,
} from '../actions';

export const runInstall = async (logger: ILogger) => {
    const releaseOverview = getReleaseOverview();
    const { packages = [] } = releaseOverview;

    const packageNames = packages.map((p) => p.name);
    const selectedPackage = await askForOption(
        'Select package to install:',
        packageNames
    );

    const { latestVersion } = packages.find((p) => p.name === selectedPackage);

    if (!latestVersion) {
        throw new Error(
            `Unable to find latest version for package: ${selectedPackage}`
        );
    }

    const targetPath = getReleaseTargetFilePath(selectedPackage, latestVersion);

    if (!hasFile(targetPath)) {
        throw new Error(`No such file: ${targetPath}`);
    }

    const packageJsonPath = getCwdPath('package.json');
    const packageJsonContent = getEmpiriskaPackageJson(logger, packageJsonPath);

    const {
        type: dependencyType,
        version: existingVersion,
    } = getExistingPackageVersion(packageJsonContent, selectedPackage);

    const hasExactVersion = existingVersion === latestVersion;

    if (hasExactVersion) {
        return logger.log(
            `The package "${selectedPackage}" already has the latest version "${latestVersion}". Nothing to do here.`
        );
    }

    const safeDependencyType =
        dependencyType ||
        ((await askForOption(
            'How do you want to install the dependency?',
            Object.values(DependencyType)
        )) as DependencyType);

    const hasNewMajor = hasNewMajorVersion(latestVersion, existingVersion);

    if (hasNewMajor) {
        const allPackages = await getAllEmpiriskaPackages(logger);

        await promptForNewMajor(
            logger,
            allPackages,
            selectedPackage,
            latestVersion,
            existingVersion
        );
    }

    updateDependency(
        packageJsonContent,
        packageJsonPath,
        safeDependencyType,
        selectedPackage,
        targetPath
    );

    await runYarnInstall(logger);

    logger.log(
        `✅ Added version "${latestVersion}" of package "${selectedPackage}".`
    );
};
