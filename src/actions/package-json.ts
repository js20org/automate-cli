import {
    Executor,
    sortObject,
    getJsonFileContent,
    saveJsonFile,
    ILogger,
} from 'js-common-node';

import {
    getExtractedSemanticVersion,
    getParsedSemanticVersion,
} from '../utils';

import {
    assertAllOptionsOk,
    CustomOption,
    getOption,
} from './package-json-custom-options';

import { DependencyType } from '../types';

export enum PackageJsonScript {
    BUILD = 'build',
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

    const shouldBeReleased = getOption(
        logger,
        packageJsonPath,
        packageJsonContent,
        CustomOption.SHOULD_BE_RELEASED
    );

    const requiredScripts = [];

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
    return await executor.execute(`npm run ${script}`);
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

export const setPackageJsonDependency = (
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
