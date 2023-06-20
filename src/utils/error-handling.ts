import { ILogger } from '../types';
import { fontDim, fontRed } from './font';

export const handleError = (logger: ILogger, error: Error) => {
    logger.log(`❌ [ERROR] An error occured:\n`);

    const isError = error?.message && error?.stack;

    if (isError) {
        logger.log(fontRed(error.message));

        const stackOnly = error.stack.replace(error.message, '');
        logger.log(fontDim(stackOnly));
    } else {
        logger.log(error);
    }
};
