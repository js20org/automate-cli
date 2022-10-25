import {
    assertNoGitChanges,
    fetchGitTags,
    getAllGitTags,
    getCurrentGitBranch,
    getCwdChangelog,
    getCwdPath,
    getReleasePackageJsonContent,
    getSelectedRegistry,
    gitCheckoutBranch,
    gitCheckoutTag,
    releasePackage,
    runYarnInstall,
} from '../actions';

import { IEnvironment, ILogger } from '../types';
import { askForOption } from '../utils';

export const runBuildRelease = async (
    logger: ILogger,
    environment: IEnvironment
) => {
    const registry = await getSelectedRegistry(environment);
    const originalBranch = await getCurrentGitBranch(logger);

    await assertNoGitChanges(logger);
    await fetchGitTags(logger);

    const versions = await getAllGitTags(logger);
    const hasNoVersions = versions.length === 0;

    if (hasNoVersions) {
        throw new Error('No versions of this package exist yet.');
    }

    const option = await askForOption('Select version to build:', versions);

    await gitCheckoutTag(logger, option);
    await runYarnInstall(logger);

    const packageJsonFullPath = getCwdPath('package.json');
    const packageJsonContent = getReleasePackageJsonContent(
        logger,
        packageJsonFullPath
    );

    const { name, version } = packageJsonContent;

    const changelog = getCwdChangelog();
    const breakingChanges = changelog?.versions?.find(
        (v) => v.version === version
    )?.breakingChanges;

    const hasReleaseAlready = await releasePackage(
        logger,
        registry,
        packageJsonContent,
        breakingChanges
    );

    if (!hasReleaseAlready) {
        logger.log(`Built version "${version}" of package "${name}".`);
    }

    await gitCheckoutBranch(logger, originalBranch);
};
