import {
    ILogger,
    askForOption,
    askForOptionalString,
} from '@empiriska/js-common-backend';

import { ICommit } from '../types';

import {
    assertGitBranchUpToDate,
    assertIsOnGitBranch,
    assertNoGitChanges,
    commitVersion,
    createAndPushGitTag,
    fetchGitTags,
    getCwdPath,
    getEmpiriskaPackageJson,
    getNewVersionInfo,
    getOrCreateChangelog,
    pushEmpiriskaGitBranch,
    saveChangelog,
    updatePackageJsonVersion,
    VersionType,
} from '../actions';

const getTypeInput = async (
    logger: ILogger,
    packageJsonContent: Record<string, any>
) => {
    const { version } = packageJsonContent;
    logger.log(`Current version: ${version}`);

    const types = Object.values(VersionType);
    const initialIndex = types.indexOf(VersionType.PATCH);

    const type = await askForOption(
        'What is the type of your release?',
        types,
        initialIndex
    );

    return type as VersionType;
};

const getInput = async (
    logger: ILogger,
    type: VersionType,
    commits: ICommit[]
) => {
    logger.log('Commits included in this version:');

    for (const commit of commits) {
        logger.log(`[c] ${commit.date} ${commit.message}`);
    }

    const changelogEntries: string[] = [];

    while (true) {
        const entry = await askForOptionalString(
            'Enter a changelog entry. Respond blank when finished.'
        );

        if (!entry) {
            break;
        }

        changelogEntries.push(entry);
    }

    const isMajor = type === VersionType.MAJOR;
    let breakingChangesDescription = '';

    if (isMajor) {
        breakingChangesDescription = await askForOptionalString(
            'Please enter a breaking changes description:'
        );
    }

    return {
        changelogEntries,
        breakingChangesDescription,
    };
};

const updateChangelog = (
    packageJsonContent: Record<string, any>,
    newVersionString: string,
    breakingChangesDescription: string,
    changelogEntries: string[]
) => {
    const changelog = getOrCreateChangelog(packageJsonContent.name);
    changelog.versions.push({
        version: newVersionString,
        date: new Date().toISOString(),
        breakingChanges: breakingChangesDescription,
        entries: changelogEntries,
    });

    saveChangelog(changelog);
};

export const runCustomerVersion = async (logger: ILogger) => {
    const packageJsonFullPath = getCwdPath('package.json');
    const packageJsonContent = await getEmpiriskaPackageJson(
        logger,
        packageJsonFullPath
    );

    await assertNoGitChanges(logger);
    await assertIsOnGitBranch(logger, 'master');
    await assertGitBranchUpToDate(logger);
    await fetchGitTags(logger);

    const { version } = packageJsonContent;

    const type = await getTypeInput(logger, packageJsonContent);
    const info = await getNewVersionInfo(logger, version, <VersionType>type);

    if (!info) {
        return;
    }

    const { newVersionString, newTag, commits } = info;
    const { changelogEntries, breakingChangesDescription } = await getInput(
        logger,
        type,
        commits
    );

    updatePackageJsonVersion(
        packageJsonFullPath,
        packageJsonContent,
        newVersionString
    );

    updateChangelog(
        packageJsonContent,
        newVersionString,
        breakingChangesDescription,
        changelogEntries
    );

    await commitVersion(logger, newVersionString);
    await pushEmpiriskaGitBranch(logger, 'master');
    await createAndPushGitTag(logger, newTag);

    logger.log(
        `🚀 Versioned "${newVersionString}" of package "${packageJsonContent.name}".`
    );
};
