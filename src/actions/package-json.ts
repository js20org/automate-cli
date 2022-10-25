import path from 'path';

import {
    getJsonFileContent,
    getFilesRecursivelyWithoutNodeModules,
    saveJsonFile,
    getRepositoryChangelog,
} from '.';

import {
    askForBoolean,
    Executor,
    fontDim,
    getExtractedSemanticVersion,
    getParsedSemanticVersion,
    sortObject,
} from '../utils';

import {
    assertAllOptionsOk,
    CustomOption,
    getOption,
    isEmpProject,
} from './package-json-custom-options';

import { IChangelogEntry, ILogger } from '../types';
import { getCwdPath } from './path';

export interface IPackageInfo {
    name: string;
    path: string;
    directoryPath: string;
    content: Record<string, any>;
}

export enum PackageJsonScript {
    BUILD = 'build',
    TEST = 'test',
}

export enum DependencyType {
    DEPENDENCIES = 'dependencies',
    DEV_DEPENDENCIES = 'devDependencies',
}

const reportError = (
    logger: ILogger,
    packageJsonPath: string,
    error: string
) => {
    logger.log(`Package.json: ${packageJsonPath}`);
    throw new Error(error);
};

const assertIsString = (
    logger: ILogger,
    packageJsonPath: string,
    key: string,
    value: any
) => {
    const isValid = value && typeof value === 'string';

    if (!isValid) {
        reportError(
            logger,
            packageJsonPath,
            `Expected "${key}" in package.json to be a valid string.`
        );
    }
};

const assertHasScripts = (
    logger: ILogger,
    packageJsonPath: string,
    packageJsonContent: Record<string, any>
) => {
    const { scripts = {} } = packageJsonContent;

    const hasNoTestsIsEnabled = getOption(
        logger,
        packageJsonPath,
        packageJsonContent,
        CustomOption.NO_TESTS
    );

    const shouldBeReleased = getOption(
        logger,
        packageJsonPath,
        packageJsonContent,
        CustomOption.SHOULD_BE_RELEASED
    );

    const requiredScripts = [];

    if (!hasNoTestsIsEnabled) {
        requiredScripts.push(PackageJsonScript.TEST);
    }

    if (shouldBeReleased) {
        requiredScripts.push(PackageJsonScript.BUILD);
    }

    for (const value of requiredScripts) {
        const hasScript = !!scripts[value];

        if (!hasScript) {
            reportError(
                logger,
                packageJsonPath,
                `Expected script "${value}" to be present in your package.json file.`
            );
        }
    }
};

const assertValidPackageJson = (
    logger: ILogger,
    packageJsonPath: string,
    packageJsonContent: Record<string, any>
) => {
    const { name, version, license } = packageJsonContent;

    assertIsString(logger, packageJsonPath, 'name', name);
    assertIsString(logger, packageJsonPath, 'version', version);
    assertIsString(logger, packageJsonPath, 'license', license);
    assertAllOptionsOk(logger, packageJsonPath, packageJsonContent);
    assertHasScripts(logger, packageJsonPath, packageJsonContent);
};

export const runPackageJsonScript = async (
    logger: ILogger,
    script: PackageJsonScript
) => {
    const executor = new Executor(logger);
    return await executor.execute(`yarn ${script}`);
};

export const getVerifiedPackageJson = (
    logger: ILogger,
    packageJsonFullPath: string
) => {
    const packageJsonContent =
        getJsonFileContent<Record<string, any>>(packageJsonFullPath);

    assertValidPackageJson(logger, packageJsonFullPath, packageJsonContent);

    return packageJsonContent;
};

export const getAllOwnPackageJson = async (
    logger: ILogger
): Promise<IPackageInfo[]> => {
    const matches = await getFilesRecursivelyWithoutNodeModules('package.json');
    const result = matches.map((m) => {
        const packageJsonFullPath = getCwdPath(m);
        const content =
            getJsonFileContent<Record<string, any>>(packageJsonFullPath);

        const isEmp = isEmpProject(content);

        if (!isEmp) {
            return null;
        }

        assertIsString(logger, m, 'name', content.name);
        assertValidPackageJson(logger, packageJsonFullPath, content);

        return {
            name: content.name,
            path: m,
            directoryPath: path.dirname(m),
            content,
        };
    });

    return result.filter((i) => !!i);
};

export const getExistingPackageVersion = (
    packageJsonContent: Record<string, any>,
    packageName: string
) => {
    const allDependencyTypes = Object.values(DependencyType);

    for (const type of allDependencyTypes) {
        const content = packageJsonContent[type] || {};
        const version = content[packageName];

        if (version) {
            return {
                version: getExtractedSemanticVersion(version),
                type,
            };
        }
    }

    return {};
};

export const updateDependency = (
    packageJsonContent: Record<string, any>,
    packageJsonPath: string,
    dependencyType: DependencyType,
    packageName: string,
    target: string
) => {
    const dependencyObject = packageJsonContent[dependencyType] || {};
    const result = {
        ...dependencyObject,
        [packageName]: target,
    };

    packageJsonContent[dependencyType] = sortObject(result);
    saveJsonFile(packageJsonPath, packageJsonContent);
};

export const hasNewMajorVersion = (
    latestVersion: string,
    existingVersion?: string
) => {
    const existingMajor = existingVersion
        ? getParsedSemanticVersion(existingVersion).major
        : null;
    const latestMajor = getParsedSemanticVersion(latestVersion).major;

    return existingMajor !== null && latestMajor > existingMajor;
};

const getSummary = (
    packageName: string,
    newVersion: string,
    existingVersion: string,
    allEntries: IChangelogEntry[]
) => {
    const newMajor = getParsedSemanticVersion(newVersion).major;
    const existingMajor = getParsedSemanticVersion(existingVersion).major;

    const relevantVersions = allEntries.filter((v) => {
        const major = getParsedSemanticVersion(v.version).major;
        return major > existingMajor && major <= newMajor;
    });

    const breakingChanges = relevantVersions
        .filter((v) => !!v.breakingChanges)
        .map((v) => fontDim(`${v.version} - ${v.breakingChanges}`))
        .join('\n');

    return `
${packageName} - ${newVersion}

Breaking changes:
${breakingChanges}
`;
};

export const promptForNewMajor = async (
    logger: ILogger,
    allPackages: IPackageInfo[],
    packageName: string,
    newVersion: string,
    existingVersion: string
) => {
    const packageInfo = allPackages.find((p) => p.name === packageName);

    if (!packageInfo) {
        throw new Error(`No such package: ${packageInfo}`);
    }

    const changelog = getRepositoryChangelog(packageInfo.directoryPath);
    const entry = changelog.versions.find((v) => v.version === newVersion);

    if (!entry) {
        throw new Error(
            'Unable to find changelog version. Is the package correctly installed?'
        );
    }

    const summary = getSummary(
        packageName,
        newVersion,
        existingVersion,
        changelog.versions
    );

    logger.log(summary);

    const shouldContinue = await askForBoolean('Do you want to continue?');

    if (!shouldContinue) {
        throw Error('Failed by user request.');
    }
};
