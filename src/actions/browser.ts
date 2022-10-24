import { Executor, ILogger } from '@empiriska/js-common-backend';

export const openBrowserWindow = async (logger: ILogger, url: string) => {
    const executor = new Executor(logger);
    await executor.execute(`open ${url}`);
};
