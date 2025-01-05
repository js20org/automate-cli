import { ILogger, Executor } from '@js20/node-utils';

export const runNpmInstall = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('npm install');
};
