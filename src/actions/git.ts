import { ICommit, ILogger } from '../types';
import { assertIsString, Executor } from '../utils';

export const getGitChanges = async (logger: ILogger) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute('git status');

    return combinedOut;
};

export const hasGitChanges = async (logger: ILogger) => {
    const combinedOut = await getGitChanges(logger);
    return !combinedOut.includes('nothing to commit, working tree clean');
};

export const assertNoGitChanges = async (logger: ILogger) => {
    const executor = new Executor(logger);

    await executor.execute('git status');
    executor.assertOutputIncludes(
        'nothing to commit, working tree clean',
        'Make sure you have committed all of your local changes.'
    );
};

export const assertIsOnGitBranch = async (
    logger: ILogger,
    branchName: string
) => {
    const executor = new Executor(logger);

    await executor.execute('git branch --no-color');
    executor.assertOutputIncludes(
        `\* ${branchName}\n`,
        `Expected to be on the "${branchName}" branch`
    );
};

export const assertGitBranchUpToDate = async (logger: ILogger) => {
    const executor = new Executor(logger);

    await executor.execute('git remote update');
    await executor.execute('git status -uno');

    executor.assertOutputIncludes(
        "Your branch is up to date with 'origin/",
        'Expected branch to be up to date with remote. Fix this by running git pull.'
    );
};

export const hasGitTag = async (
    logger: ILogger,
    tag: string
): Promise<boolean> => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute(`git tag -l "${tag}"`);

    return combinedOut.includes(tag);
};

export const fetchGitTags = async (logger: ILogger) => {
    const executor = new Executor(logger);

    await executor.execute('git fetch --tags');
};

export const createAndPushGitTag = async (logger: ILogger, tag: string) => {
    const executor = new Executor(logger);

    await executor.execute(`git tag -a ${tag} -m "Version ${tag}"`);
    executor.assertEmptyResponse();

    await executor.execute(`git push origin ${tag}`);
    executor.assertOutputMatches(
        new RegExp(`\\*\\s\\[new tag\\]\\s+${tag}\\s->\\s${tag}`, 'g')
    );
};

const GET_COMMITS_COMMAND =
    'git log --pretty=format:"%h||%s||%an||%ad" --no-patch';

const parseCommits = (combinedOut: string): ICommit[] => {
    const lines = combinedOut.split('\n').filter((l) => !!l);
    return lines.map((l) => {
        const [id, message, author, date] = l.split('||');

        assertIsString(id);
        assertIsString(message);
        assertIsString(author);
        assertIsString(date);

        return {
            id,
            message,
            author,
            date,
        };
    });
};

const filterCommits = (commits: ICommit[]) => {
    return commits.filter((c) => !c.message.startsWith('Merge branch '));
};

export const getGitCommitsSinceTag = async (logger: ILogger, tag: string) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute(
        `${GET_COMMITS_COMMAND} HEAD...${tag}`
    );

    return filterCommits(parseCommits(combinedOut));
};

export const getGitCommitsSinceStart = async (logger: ILogger) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute(GET_COMMITS_COMMAND);

    return filterCommits(parseCommits(combinedOut));
};

export const addAllGitFiles = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('git add -A');
};

export const performGitCommitAll = async (
    logger: ILogger,
    commitMessage: string
) => {
    const commitCommand = `git commit -m "${commitMessage}"`;
    const executor = new Executor(logger);

    await executor.execute(commitCommand);
    executor.assertOutputIncludes(commitMessage);
};

export const createGitCommit = async (
    logger: ILogger,
    files: string[],
    commitMessage: string
) => {
    const filesString = files.join(' ');

    const addCommand = `git add ${filesString}`;
    const commitCommand = `git commit ${filesString} -m "${commitMessage}"`;

    const executor = new Executor(logger);

    await executor.execute(addCommand);
    executor.assertEmptyResponse();

    await executor.execute(commitCommand);
    executor.assertOutputIncludes('[main ');
    executor.assertOutputIncludes(commitMessage);
};

const getPullRequestUrl = (remotePushLine: string, branchName: string) => {
    const originMatch = remotePushLine.match(/:(.*)\.git/);

    if (!originMatch) {
        throw new Error('Unable to determine origin.');
    }

    const [, origin] = originMatch;
    return `https://github.com/${origin}/compare/${branchName}?expand=1`;
};

export const pushGitBranch = async (logger: ILogger, branchName: string) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute('git remote -v');

    const lines = combinedOut.split('\n');
    const pushLine = lines.find((l) => l.includes('(push)'));

    await executor.execute(`git push origin ${branchName}`);

    return getPullRequestUrl(pushLine, branchName);
};

export const getAllGitTags = async (logger: ILogger) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute('git tag');

    return combinedOut.split('\n').filter((l) => !!l);
};

export const gitCheckoutTag = async (logger: ILogger, tag: string) => {
    const executor = new Executor(logger);

    await executor.execute(`git checkout ${tag}`);
    executor.assertOutputIncludes(`switching to '${tag}'`);
    executor.assertOutputIncludes('HEAD is now at');
};

export const getCurrentGitBranch = async (logger: ILogger) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute('git branch --show-current');

    return combinedOut.trim();
};

export const gitCheckoutBranch = async (logger: ILogger, branch: string) => {
    const executor = new Executor(logger);

    await executor.execute(`git checkout ${branch}`);
    executor.assertOutputIncludes(`Switched to branch '${branch}'`);
};

export const gitCheckoutNewBranch = async (logger: ILogger, branch: string) => {
    const executor = new Executor(logger);

    await executor.execute(`git checkout -b ${branch}`);
    executor.assertOutputIncludes(`Switched to a new branch '${branch}'`);
};
