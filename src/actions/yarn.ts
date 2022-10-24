import { ILogger } from '../types';
import { Executor } from '../utils';

export const runYarnInstall = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('yarn install');
};

export const runYarnAudit = async (logger: ILogger) => {
    //Throws error when there are audit issues

    const executor = new Executor(logger);
    await executor.execute('yarn audit');
};
