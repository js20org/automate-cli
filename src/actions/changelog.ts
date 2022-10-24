import path from 'path';

import { IChangelog } from '../types';
import { getJsonFileContent, getOrCreateJsonFile, saveJsonFile } from './file';
import { getCwdPath } from './path';

export const CHANGELOG_NAME = 'changelog.json';

export const getRepositoryChangelog = (directory: string) => {
    const target = path.resolve(directory, CHANGELOG_NAME);
    return getJsonFileContent<IChangelog>(target);
};

export const getOrCreateChangelog = (packageName: string): IChangelog => {
    const target = getCwdPath(CHANGELOG_NAME);
    
    const content = getOrCreateJsonFile<IChangelog>(target);
    const hasExistingChangelog = !!content.name;

    return hasExistingChangelog ? content : {
        name: packageName,
        versions: []
    };
};

export const saveChangelog = (changelog: IChangelog) => {
    const target = getCwdPath(CHANGELOG_NAME);
    saveJsonFile(target, changelog);
};
