import path from 'path';

import {
    getJsonFileContent,
    IPackageInfo,
    PackageJsonScript,
    runPackageJsonScript,
} from '.';

import { ILogger } from '../types';

interface ICoverageType {
    pct: number;
}

interface ICoverageContent {
    total: {
        statements: ICoverageType;
    };
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
