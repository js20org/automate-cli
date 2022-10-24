import { getCwdPath, getEmpiriskaPackageJson } from '../actions';
import { ILogger } from '../types';

export const runVerify = async (logger: ILogger) => {
    const packageJsonPath = getCwdPath('package.json');

    //Load and run assertions
    getEmpiriskaPackageJson(logger, packageJsonPath);

    logger.log('✅ The project is correctly configured.')
};
