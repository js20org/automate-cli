import { getLargestSemanticVersion } from '@empiriska/js-common-backend';

import { getReleaseDirPath } from '.';
import { IReleaseOverview } from '../types';
import { getOrCreateJsonFile, saveJsonFile } from './file';

const RELEASE_OVERVIEW_FILE_NAME = '.overview.json';

export const getReleaseOverview = (): IReleaseOverview => {
    const targetPath = getReleaseDirPath(RELEASE_OVERVIEW_FILE_NAME);
    return getOrCreateJsonFile(targetPath);
};

const saveReleaseOverview = (content: IReleaseOverview) => {
    const targetPath = getReleaseDirPath(RELEASE_OVERVIEW_FILE_NAME);
    saveJsonFile(targetPath, content);
};

export const registerNewRelease = (
    packageName: string,
    packageVersion: string
) => {
    const overview = getReleaseOverview();
    const hasPackages = !!overview.packages;

    if (!hasPackages) {
        overview.packages = [];
    }

    const { packages } = overview;
    const existing = packages.find((p) => p.name === packageName);

    if (existing) {
        existing.latestVersion = getLargestSemanticVersion(
            existing.latestVersion,
            packageVersion
        );
    } else {
        packages.push({
            name: packageName,
            latestVersion: packageVersion,
        });
    }

    saveReleaseOverview(overview);
};
