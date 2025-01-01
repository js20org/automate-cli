import { askForOption, ILogger } from 'js-common-node';

import {
    getCwdPath,
    getDependencyRelativeFilePath,
    getExistingPackageVersion,
    getSelectedRegistry,
    getVerifiedPackageJson,
    replaceDependencyFile,
    runNpmInstall,
    setPackageJsonDependency,
} from '../actions';

import { DependencyType, IEnvironment } from '../types';

export const runInstall = async (
    logger: ILogger,
    environment: IEnvironment
) => {
    const registry = await getSelectedRegistry(environment);
    const packageNames = await registry.getAllPackageNames();

    const hasPackages = packageNames.length > 0;

    if (!hasPackages) {
        return logger.log('No packages exist.');
    }

    packageNames.sort((a, b) => a.localeCompare(b));

    const selectedPackageName = await askForOption(
        'Select package to install:',
        packageNames
    );

    const latestVersion = await registry.getPackageLatestVersion(
        selectedPackageName
    );

    if (!latestVersion) {
        throw new Error(
            `Unable to find latest version for package: ${selectedPackageName}`
        );
    }

    const { fileName, version } = latestVersion;
    const hasRelease = await registry.hasRelease(fileName);

    if (!hasRelease) {
        throw new Error(
            `No such release exists: ${selectedPackageName}@${version}`
        );
    }

    const packageJsonPath = getCwdPath('package.json');
    const packageJsonContent = getVerifiedPackageJson(logger, packageJsonPath);

    const { version: existingVersion } = getExistingPackageVersion(
        packageJsonContent,
        selectedPackageName
    );

    if (existingVersion) {
        return logger.log(
            `The package "${selectedPackageName}" is already installed. Run "emp upgrade" if you want to upgrade a package version.`
        );
    }

    const dependencyType: DependencyType = (await askForOption(
        'How do you want to install the dependency?',
        Object.values(DependencyType)
    )) as DependencyType;

    await replaceDependencyFile(registry, latestVersion, existingVersion);

    const packageJsonTarget = getDependencyRelativeFilePath(
        latestVersion.fileName
    );

    setPackageJsonDependency(
        packageJsonContent,
        packageJsonPath,
        dependencyType,
        latestVersion.packageName,
        packageJsonTarget
    );

    await runNpmInstall(logger);

    logger.log(
        `✅ Added version "${version}" of package "${selectedPackageName}".`
    );
};
