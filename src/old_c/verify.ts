import { getCwdPath, getVerifiedPackageJson } from '../actions';
import { ILogger } from '../types';

export const runVerify = async (logger: ILogger) => {
    const packageJsonPath = getCwdPath('package.json');

    //Load and run assertions
    getVerifiedPackageJson(logger, packageJsonPath);

    logger.log('✅ The project is correctly configured.')
};
