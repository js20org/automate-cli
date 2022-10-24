import { exec } from 'child_process';
import { IExecuteResult, ILogger } from '../types';
import { fontDim } from './font';

const logCommandError = (logger: ILogger, result: IExecuteResult) => {
    if (result.error) {
        logger.log(result.error.message);
    }

    logger.log('Command stdout/stderr:\n')
    logger.log(fontDim(result.combinedOut));
};

const logCommandExecuting = (logger: ILogger, command: string) => {
    logger.log(fontDim(`Executing: '${command}'`));
};

const execute = async (command: string): Promise<IExecuteResult> => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            const result: IExecuteResult = {
                error,
                combinedOut: `${stdout}\n${stderr}`,
            };

            resolve(result);
        });
    });
};

export class Executor {
    private logger: ILogger;
    private lastResult: IExecuteResult;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    async execute(command: string): Promise<IExecuteResult> {
        logCommandExecuting(this.logger, command);
        
        this.lastResult = await execute(command);
        this.logger.logVerbose(fontDim(this.lastResult.combinedOut));

        if (this.lastResult.error) {
            return <any>this.failWithError(
                new Error(this.lastResult.error.message)
            );
        }

        return this.lastResult;
    }

    private assertHasResult() {
        if (!this.lastResult) {
            throw new Error(
                'No command has been executed, so assertions are useless.'
            );
        }
    }

    private failWithError(error: Error) {
        logCommandError(this.logger, this.lastResult);
        throw error;
    }

    assertOutputMatches(pattern: RegExp) {
        this.assertHasResult();

        const isMatch = pattern.test(this.lastResult.combinedOut);

        if (!isMatch) {
            return this.failWithError(
                new Error('Command response did not match pattern.')
            );
        }

        return this;
    }

    assertOutputIncludes(content: string, explanation: string = '') {
        this.assertHasResult();

        const isMatch = this.lastResult.combinedOut.includes(content);

        if (!isMatch) {
            return this.failWithError(
                new Error(`Command response did not include "${content}".\n${explanation}`)
            );
        }

        return this;
    }

    assertEmptyResponse() {
        const isEmpty = this.lastResult.combinedOut.trim().length === 0;

        if (!isEmpty) {
            return this.failWithError(
                new Error('Expected command output to be empty.')
            );
        }
        
        return this;
    }
}
