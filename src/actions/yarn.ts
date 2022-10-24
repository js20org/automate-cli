import { ILogger, Executor } from '@empiriska/js-common-backend';

export const runYarnInstall = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('yarn install');
};

export const runYarnAudit = async (logger: ILogger) => {
    //Throws error when there are audit issues

    const executor = new Executor(logger);
    await executor.execute('yarn audit');
};
