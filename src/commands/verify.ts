import { ILogger } from '@empiriska/js-common-backend';
import { getCwdPath, getEmpiriskaPackageJson } from '../actions';

export const runVerify = async (logger: ILogger) => {
    const packageJsonPath = getCwdPath('package.json');

    //Load and run assertions
    getEmpiriskaPackageJson(logger, packageJsonPath);

    logger.log('✅ The project is correctly configured.')
};
