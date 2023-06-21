import path from 'path';

import {
    createDirectoryIfNotExists,
    getFileHash,
    hasFile,
    safeDeleteFile,
} from 'js-common-node';

import { IPackageVersion, IRegistry } from '../types';
import { getCwdPath } from './path';
import { getReleaseFileName } from './release';

const DEPENDENCY_FOLDER = '.dependencies';

const removeOldZip = (
    folderPath: string,
    packageName: string,
    existingVersion: string | null
) => {
    const existingFileName = getReleaseFileName(packageName, existingVersion);

    const existingFilePath = path.resolve(folderPath, existingFileName);
    const hasExistingZip = hasFile(existingFilePath);

    if (hasExistingZip) {
        safeDeleteFile(existingFilePath, '.tgz');
        return existingFileName;
    } else {
        return null;
    }
};

export const replaceDependencyFile = async (
    registry: IRegistry,
    packageVersion: IPackageVersion,
    existingVersion: string | null
) => {
    const folderPath = getCwdPath(DEPENDENCY_FOLDER);
    createDirectoryIfNotExists(folderPath);

    const { packageName, version, fileName, fileHash } = packageVersion;
    let removedZipPath: string = null;

    if (existingVersion) {
        const removedZipFileName = removeOldZip(
            folderPath,
            packageName,
            existingVersion
        );

        removedZipPath = getDependencyRelativeFilePath(removedZipFileName);
    }

    const targetFullPath = path.resolve(folderPath, fileName);
    const hasTargetAlready = hasFile(targetFullPath);

    if (hasTargetAlready) {
        throw new Error('Target already exists: ' + targetFullPath);
    }

    await registry.downloadRelease(packageName, version, targetFullPath);

    const targetFileHash = await getFileHash(targetFullPath);
    const isSameHash = targetFileHash === fileHash;

    if (!isSameHash) {
        throw new Error(
            '[Important!] The hash for the downloaded zip release did not match the expected hash. Are you experiencing a man in the middle attack?'
        );
    }

    const addedZipPath = getDependencyRelativeFilePath(fileName);

    return {
        removedZipPath,
        addedZipPath,
    };
};

export const getDependencyRelativeFilePath = (fileName: string) => {
    const folderPath = getCwdPath(DEPENDENCY_FOLDER);
    const absolutePath = path.resolve(folderPath, fileName);
    const relative = path.relative(process.cwd(), absolutePath);

    return `./${relative}`;
};
