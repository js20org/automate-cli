import { ILogger } from '../types';
import { Executor } from '../utils';

export const openBrowserWindow = async (logger: ILogger, url: string) => {
    const executor = new Executor(logger);
    await executor.execute(`open ${url}`);
};
