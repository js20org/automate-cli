import { askForOption, ILogger } from '@empiriska/js-common-backend';

import {
    fetchGitTags,
    getReleasePackageJsonContent,
    releasePackage,
    getAllGitTags,
    assertNoGitChanges,
    gitCheckoutTag,
    getCurrentGitBranch,
    gitCheckoutBranch,
    getCwdPath,
} from '../actions';

export const runReleaseLocal = async (logger: ILogger) => {
    const originalBranch = await getCurrentGitBranch(logger);

    await assertNoGitChanges(logger);
    await fetchGitTags(logger);

    const versions = await getAllGitTags(logger);
    const hasNoVersions = versions.length === 0;

    if (hasNoVersions) {
        throw new Error('No versions of this package exist yet.');
    }

    const option = await askForOption(
        'Select version to locally release:',
        versions
    );
    
    await gitCheckoutTag(logger, option);

    const packageJsonFullPath = getCwdPath('package.json');
    const packageJsonContent = await getReleasePackageJsonContent(
        logger,
        packageJsonFullPath
    );

    const hasReleaseAlready = await releasePackage(logger, packageJsonContent);
    const { name, version } = packageJsonContent;

    if (!hasReleaseAlready) {
        logger.log(
            `Locally released version "${version}" of package "${name}".`
        );
    }

    await gitCheckoutBranch(logger, originalBranch);
};
