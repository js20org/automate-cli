import { CustomOption, getCwdPath, getOption, getOptionDescription } from '.';
import { ILogger, IRegistry } from '../types';

import {
    assertFileDoesNotExists,
    assertFileExists,
    Executor,
    getFileHash,
    safeDeleteFile,
} from '../utils';

import {
    getVerifiedPackageJson,
    PackageJsonScript,
    runPackageJsonScript,
} from './package-json';

const getFileName = (name: string, version: string) =>
    `${name}-v${version}.tgz`;

const getConvertedPackageName = (name: string) => {
    return name.replace(new RegExp('/', 'g'), '-').replace('@', '');
};

export const getReleaseFileName = (name: string, version: string) => {
    const convertedName = getConvertedPackageName(name);
    return getFileName(convertedName, version);
};

const performRelease = async (
    logger: ILogger,
    registry: IRegistry,
    packageName: string,
    packageVersion: string,
    breakingChangesDescription: string
) => {
    const executor = new Executor(logger);

    const fileName = getReleaseFileName(packageName, packageVersion);
    const fullPath = getCwdPath(fileName);

    assertFileDoesNotExists(fullPath);

    await runPackageJsonScript(logger, PackageJsonScript.BUILD);
    await executor.execute('yarn pack');

    assertFileExists(fullPath);

    const fileHash = await getFileHash(fullPath);

    await registry.release(
        fullPath,
        fileName,
        packageName,
        packageVersion,
        fileHash,
        breakingChangesDescription
    );

    safeDeleteFile(fullPath, '.tgz');
};

export const releasePackage = async (
    logger: ILogger,
    registry: IRegistry,
    packageJsonContent: Record<string, any>,
    breakingChangesDescription: string
) => {
    const { name, version } = packageJsonContent;

    const fileName = getReleaseFileName(name, version);
    const hasReleaseAlready = await registry.hasRelease(fileName);

    if (hasReleaseAlready) {
        logger.log(`${name}@${version} was already released.`);
    } else {
        await performRelease(
            logger,
            registry,
            name,
            version,
            breakingChangesDescription
        );
    }

    return hasReleaseAlready;
};

export const getReleasePackageJsonContent = (
    logger: ILogger,
    packageJsonFullPath: string
) => {
    const packageJsonContent = getVerifiedPackageJson(
        logger,
        packageJsonFullPath
    );

    const shouldBeReleased = getOption(
        logger,
        packageJsonFullPath,
        packageJsonContent,
        CustomOption.SHOULD_BE_RELEASED
    );

    if (!shouldBeReleased) {
        const description = getOptionDescription(
            CustomOption.SHOULD_BE_RELEASED,
            'true'
        );

        throw new Error(
            `This repository is not marked as a release. Please set the correct package.json flag:\n${description}`
        );
    }

    return packageJsonContent;
};
