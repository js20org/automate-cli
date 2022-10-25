import { ILogger } from '../types';
import { Executor } from '../utils';

export const runYarnInstall = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('yarn install');
};
