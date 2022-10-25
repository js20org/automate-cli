import { ILogger } from '../types';
import { fontDim, fontRed } from './font';

export const handleError = (logger: ILogger, error: Error) => {
    logger.log(`❌ [ERROR] An error occured:\n`);
    logger.log(fontRed(error.message));
    logger.log(fontDim(error.stack));
};
