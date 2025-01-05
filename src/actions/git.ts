import { Executor, ILogger } from '@js20/node-utils';

export const getGitChanges = async (logger: ILogger) => {
    const executor = new Executor(logger);
    const { combinedOut } = await executor.execute('git status');

    return combinedOut;
};

export const hasGitChanges = async (logger: ILogger) => {
    const combinedOut = await getGitChanges(logger);
    return !combinedOut.includes('nothing to commit, working tree clean');
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

    return getPullRequestUrl(pushLine!, branchName);
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
