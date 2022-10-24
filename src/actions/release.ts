import {
    assertReleaseExists,
    CustomOption,
    getOption,
    getOptionDescription,
    hasRelease,
    moveRelease,
    prepareReleaseDir,
    runPackageJsonScript,
    PackageJsonScript,
    registerNewRelease,
} from '.';

import { ILogger } from '../types';
import { Executor } from '../utils';

import { getVerifiedPackageJson } from './package-json';

const performRelease = async (
    logger: ILogger,
    name: string,
    version: string
) => {
    const executor = new Executor(logger);

    await runPackageJsonScript(logger, PackageJsonScript.BUILD);
    await executor.execute('yarn pack');

    assertReleaseExists(name, version);
    moveRelease(name, version);

    registerNewRelease(name, version);
};

export const releasePackage = async (
    logger: ILogger,
    packageJsonContent: Record<string, any>
) => {
    prepareReleaseDir();

    const { name, version } = packageJsonContent;
    const hasReleaseAlready = hasRelease(name, version);

    if (hasReleaseAlready) {
        logger.log(`${name}@${version} was already released.`);
    } else {
        await performRelease(logger, name, version);
    }

    return hasReleaseAlready;
};

export const getReleasePackageJsonContent = async (
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
