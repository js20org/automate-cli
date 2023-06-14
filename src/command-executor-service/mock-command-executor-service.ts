import { ICommandExecutor, ILogger } from '../types';
import { fontDim } from '../utils';

export class MockCommandExecutorService implements ICommandExecutor {
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    async execute(command: string) {
        this.logger.log(`Run command: ${fontDim(command)}`);
    }
}
