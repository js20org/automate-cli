import { exec } from 'child_process';

import { ICommandExecutor, ILogger } from '../types';
import { fontDim } from '../utils';

export class CommandExecutorService implements ICommandExecutor {
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    async execute(command: string) {
        this.logger.log(fontDim(`Executing: "${command}"...`));

        return new Promise((resolve, reject) => {
            exec(command, (error) => {
                if (error) {
                    reject(error.message);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
