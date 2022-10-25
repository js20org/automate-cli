import path from 'path';

import {
    createDirectoryIfNotExists,
    getFileHash,
    hasFile,
    safeDeleteFile,
} from '../utils';

import { IPackageVersion, IRegistry } from '../types';
import { getCwdPath } from './path';
import { getReleaseFileName } from './release';

const DEPENDENCY_FOLDER = '.dependencies';

const removeOldZip = (
    folderPath: string,
    packageVersion: IPackageVersion,
    existingVersion: string | null
) => {
    const existingFileName = getReleaseFileName(
        packageVersion.packageName,
        existingVersion
    );

    const existingFilePath = path.resolve(folderPath, existingFileName);
    const hasExistingZip = hasFile(existingFilePath);

    if (hasExistingZip) {
        console.log('Removing: ');
        console.log(existingFilePath);

        safeDeleteFile(existingFilePath, '.tgz');
    }
};

export const replaceDependencyFile = async (
    registry: IRegistry,
    packageVersion: IPackageVersion,
    existingVersion: string | null
) => {
    const folderPath = getCwdPath(DEPENDENCY_FOLDER);
    createDirectoryIfNotExists(folderPath);

    if (existingVersion) {
        removeOldZip(folderPath, packageVersion, existingVersion);
    }

    const { packageName, version, fileName, fileHash } = packageVersion;

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
};

export const getDependencyRelativeFilePath = (
    packageVersion: IPackageVersion
) => {
    const { fileName } = packageVersion;

    const folderPath = getCwdPath(DEPENDENCY_FOLDER);
    const absolutePath = path.resolve(folderPath, fileName);
    const relative = path.relative(process.cwd(), absolutePath);

    return `./${relative}`;
};
