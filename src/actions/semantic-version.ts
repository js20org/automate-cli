import { saveJsonFile, ILogger } from '@js20/node-utils';

import {
    createGitCommit,
    getGitCommitsSinceStart,
    getGitCommitsSinceTag,
    hasGitTag,
} from './git';

import {
    getParsedSemanticVersion,
    getSerializedSemanticVersion,
} from '../utils';

import { ICommit, ISemanticVersion } from '../types';
import { CHANGELOG_NAME } from './changelog';

const COMMIT_PREFIX = '[version] ';

export enum VersionType {
    MAJOR = 'major',
    MINOR = 'minor',
    PATCH = 'patch',
}

const getNextVersion = (
    currentVersion: ISemanticVersion,
    type: VersionType
): ISemanticVersion => {
    switch (type) {
        case VersionType.PATCH:
            return {
                ...currentVersion,
                patch: currentVersion.patch + 1,
            };
        case VersionType.MINOR:
            return {
                ...currentVersion,
                minor: currentVersion.minor + 1,
                patch: 0,
            };
        case VersionType.MAJOR:
            return {
                major: currentVersion.major + 1,
                minor: 0,
                patch: 0,
            };

        default:
            throw new Error('Unknown switch option');
    }
};

const getTagName = (version: ISemanticVersion) =>
    `v${getSerializedSemanticVersion(version)}`;

export const getNewVersionInfo = async (
    logger: ILogger,
    version: string,
    type: VersionType
) => {
    const currentVersion = getParsedSemanticVersion(version);
    const currentTag = getTagName(currentVersion);

    const hasTag = await hasGitTag(logger, currentTag);
    const commitsExcludingMerges: ICommit[] = hasTag
        ? await getGitCommitsSinceTag(logger, currentTag)
        : await getGitCommitsSinceStart(logger);

    const commits = commitsExcludingMerges.filter(
        (c) => !c.message.startsWith(COMMIT_PREFIX)
    );
    const hasCommitsToRelease = commits.length > 0;

    if (!hasCommitsToRelease) {
        logger.log(`No new commits exists since latest tag "${currentTag}".`);
        return;
    }

    const newVersion = getNextVersion(currentVersion, type);
    const newVersionString = getSerializedSemanticVersion(newVersion);
    const newTag = getTagName(newVersion);

    return {
        commits,
        newVersionString,
        newTag,
    };
};

export const commitVersion = async (
    logger: ILogger,
    newVersionString: string
) => {
    const commitFiles = [CHANGELOG_NAME, 'package.json'];
    const commitMessage = `${COMMIT_PREFIX}- Automatically generated version ${newVersionString}`;
    await createGitCommit(logger, commitFiles, commitMessage);
};

export const updatePackageJsonVersion = (
    packageJsonFullPath: string,
    packageJsonContent: Record<string, any>,
    newVersionString: string
) => {
    packageJsonContent['version'] = newVersionString;
    saveJsonFile(packageJsonFullPath, packageJsonContent);
};
