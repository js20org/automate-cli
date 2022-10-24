import { ILogger } from '../types';

export const handleError = (logger: ILogger, error: any) => {
    logger.log(`❌ [ERROR] An error occured:\n`);
    logger.log(error);
};
