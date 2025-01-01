import { ILogger, Executor } from 'js-common-node';

export const runNpmInstall = async (logger: ILogger) => {
    const executor = new Executor(logger);
    await executor.execute('npm install');
};
