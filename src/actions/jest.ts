import path from 'path';

import { ILogger } from '@empiriska/js-common-backend';

import {
    getJsonFileContent,
    IPackageInfo,
    PackageJsonScript,
    runPackageJsonScript,
} from '.';

interface ICoverageType {
    pct: number;
}

interface ICoverageContent {
    total: {
        statements: ICoverageType;
    }
}

export const runTestsReturnCoverage = async (
    logger: ILogger,
    packageInfo: IPackageInfo
): Promise<number> => {
    await runPackageJsonScript(logger, PackageJsonScript.TEST);

    const coveragePath = path.resolve(
        packageInfo.directoryPath,
        'tests',
        '.coverage',
        'coverage-summary.json'
    );

    const coverageContent = getJsonFileContent<ICoverageContent>(coveragePath);
    return coverageContent.total.statements.pct;
};
