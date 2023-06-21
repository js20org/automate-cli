import { ILogger, Executor } from 'js-common-node';

export const runYarnInstall = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('yarn install');
};
