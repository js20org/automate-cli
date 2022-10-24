import path from 'path';

import {
    assertFileExists,
    moveFile,
    createDirectoryIfNotExists,
    hasFile,
} from './file';

import { environment } from './env';
import { getCwdPath } from './path';

const RELEASE_DIR = '.releases';

export const getReleaseFileName = (name: string, version: string) =>
    `${name}-v${version}.tgz`;

const getConvertedPackageName = (name: string) => {
    return name.replace(new RegExp('/', 'g'), '-').replace('@', '');
};

export const getReleaseTargetFilePath = (name: string, version: string) => {
    const convertedName = getConvertedPackageName(name);
    const absolutePath = getReleaseDirPath(getReleaseFileName(convertedName, version));

    return path.relative(process.cwd(), absolutePath);
};

export const getReleaseDirPath = (relativePath?: string) => {
    const { rootPath } = environment;

    if (relativePath) {
        return path.resolve(rootPath, RELEASE_DIR, relativePath);
    } else {
        return path.resolve(rootPath, RELEASE_DIR);
    }
};

export const prepareReleaseDir = () => {
    const target = getReleaseDirPath();
    createDirectoryIfNotExists(target);
};

export const hasRelease = (name: string, version: string) => {
    const target = getReleaseTargetFilePath(name, version);
    return hasFile(target);
};

export const assertReleaseExists = (name: string, version: string) => {
    const convertedName = getConvertedPackageName(name);
    const filePath = getCwdPath(getReleaseFileName(convertedName, version));

    assertFileExists(filePath);
};

export const moveRelease = (name: string, version: string) => {
    const convertedName = getConvertedPackageName(name);
    
    const source = getCwdPath(getReleaseFileName(convertedName, version));
    const target = getReleaseDirPath(getReleaseFileName(convertedName, version));

    moveFile(source, target, '.tgz');
};
