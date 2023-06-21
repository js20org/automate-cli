import { Executor, ILogger } from 'js-common-node';

export const openBrowserWindow = async (logger: ILogger, url: string) => {
    const executor = new Executor(logger);
    await executor.execute(`open ${url}`);
};
