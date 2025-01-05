import { Executor, ILogger } from '@js20/node-utils';

export const openBrowserWindow = async (logger: ILogger, url: string) => {
    const executor = new Executor(logger);
    await executor.execute(`open ${url}`);
};
