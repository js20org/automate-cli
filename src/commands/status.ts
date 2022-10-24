import { getFormattedNumberFromFraction } from '@empiriska/js-common';
import {
    fontDim,
    fontGreen,
    fontRed,
    fontUnderscore,
    fontYellow,
    ILogger,
} from '@empiriska/js-common-backend';

import {
    CustomOption,
    CwdMover,
    getAllOwnPackageJson,
    getExistingPackageVersion,
    getOption,
    getReleaseOverview,
    hasGitChanges,
    IPackageInfo,
    runTestsReturnCoverage,
    runYarnAudit,
} from '../actions';

import { IReleaseOverview } from '../types';

interface IPackageUpdate {
    package: string;
    existingVersion: string;
    latestVersion: string;
}

const getPackageUpdates = (
    packageJsonContent: Record<string, any>,
    releaseOverview: IReleaseOverview
) => {
    const { packages = [] } = releaseOverview;
    const updates: IPackageUpdate[] = [];

    for (const overviewPackage of packages) {
        const { name: packageName, latestVersion } = overviewPackage;

        const { version: existingVersion } = getExistingPackageVersion(
            packageJsonContent,
            packageName
        );

        const isNewVersionAvailable =
            existingVersion && existingVersion !== latestVersion;

        if (isNewVersionAvailable) {
            updates.push({
                package: packageName,
                existingVersion,
                latestVersion,
            });
        }
    }

    return updates;
};

const getCoverageFormatter = (coveragePercentage: number) => {
    const isLow = coveragePercentage < 25;
    const isMedium = coveragePercentage < 75;

    if (isLow) {
        return fontRed;
    } else if (isMedium) {
        return fontYellow;
    } else {
        return fontGreen;
    }
};

const reportStatus = (
    logger: ILogger,
    packageInfo: IPackageInfo,
    hasLocalChanges: boolean,
    packageUpdates: IPackageUpdate[],
    coverage: number | null
) => {
    const localChanges = hasLocalChanges
        ? fontRed('Has local changes')
        : fontDim('no changes');

    const updates = packageUpdates.map(
        (u) =>
            `  ${u.package} - ${fontDim(u.existingVersion)} -> ${fontGreen(
                u.latestVersion
            )}`
    );

    const updateString =
        updates.length > 0 ? `\n${updates.join('\n')}` : fontDim('none');

    const hasCoverage = coverage !== null;
    const coverageString = hasCoverage
        ? getCoverageFormatter(coverage)(
              `${getFormattedNumberFromFraction(coverage)}%`
          )
        : fontDim('no tests');

    const row = '----------------------------------------';

    logger.log('');
    logger.log(fontUnderscore(packageInfo.name));
    logger.log(row);
    logger.log(`Local changes: ${localChanges}`);
    logger.log(`Available dependency updates: ${updateString}`);
    logger.log(`Code coverage: ${coverageString}`);
    logger.log(`Audit issues: ${fontDim('no issues')}`);
    logger.log('');
};

const checkStatus = async (
    logger: ILogger,
    packageInfo: IPackageInfo,
    releaseOverview: IReleaseOverview
) => {
    const hasLocalChanges = await hasGitChanges(logger);
    const packageUpdates = getPackageUpdates(
        packageInfo.content,
        releaseOverview
    );

    try {
        await runYarnAudit(logger);
    } catch (e) {
        logger.log(e);
        logger.log(`Package.json: ${packageInfo.path}`);

        throw new Error('Audit issues.');
    }

    const hasNoTestsIsEnabled = getOption(
        logger,
        packageInfo.path,
        packageInfo.content,
        CustomOption.NO_TESTS
    );

    const coverage = hasNoTestsIsEnabled
        ? null
        : await runTestsReturnCoverage(logger, packageInfo);

    reportStatus(
        logger,
        packageInfo,
        hasLocalChanges,
        packageUpdates,
        coverage
    );
};

export const runStatus = async (logger: ILogger) => {
    const packagesInDirectory = await getAllOwnPackageJson(logger);
    const releaseOverview = getReleaseOverview();

    for (const packageMatch of packagesInDirectory) {
        const cwdMover = new CwdMover();
        cwdMover.moveTo(packageMatch.directoryPath);

        await checkStatus(logger, packageMatch, releaseOverview);

        cwdMover.moveToOriginal();
    }
};
