import path from 'path';

import {
    copyFile,
    createDirectoryIfNotExists,
    getOrCreateJsonFile,
    hasFile,
    saveJsonFile,
} from 'js-common-node';

import { getLargestSemanticVersion, getParsedSemanticVersion } from '../utils';
import { IPackageVersion, IRegistry, IRegistryConfigLocal } from '../types';

const LOCAL_REGISTRY_FOLDER_NAME = '.emp-registry';
const PACKAGES_OVERVIEW_FILE_NAME = '.packages.json';

interface IPackagesOverview {
    packages?: IPackageVersion[];
}

export class LocalRegistry implements IRegistry {
    private config: IRegistryConfigLocal;
    private registryPath: string;
    private overviewPath: string;

    constructor(config: IRegistryConfigLocal) {
        this.config = config;

        this.registryPath = path.resolve(
            this.config.registryPath,
            LOCAL_REGISTRY_FOLDER_NAME
        );

        this.overviewPath = path.resolve(
            this.registryPath,
            PACKAGES_OVERVIEW_FILE_NAME
        );
    }

    getPackages() {
        const overview = getOrCreateJsonFile<IPackagesOverview>(
            this.overviewPath
        );

        return overview.packages || [];
    }

    async initialize() {
        createDirectoryIfNotExists(this.registryPath);
    }

    async hasRelease(fileName: string) {
        const fullPath = path.resolve(this.registryPath, fileName);
        return hasFile(fullPath);
    }

    async getAllPackageNames() {
        const packages = this.getPackages();
        const names = packages.map((p) => p.packageName);

        return [...new Set(names)];
    }

    async getPackageLatestVersion(packageName: string) {
        const packages = this.getPackages();
        const allVersions = packages.filter(
            (p) => p.packageName === packageName
        );

        return getLargestSemanticVersion(allVersions);
    }

    async getBreakingChangesBetweenVersions(
        packageName: string,
        from: string,
        to: string
    ) {
        const packages = this.getPackages();
        const relevantVersions = packages.filter(
            (p) => p.packageName === packageName
        );

        const result: IPackageVersion[] = [];

        const { major: fromMajor } = getParsedSemanticVersion(from);
        const { major: toMajor } = getParsedSemanticVersion(to);

        for (const versionInfo of relevantVersions) {
            const { version, breakingChangesDescription } = versionInfo;

            const { major } = getParsedSemanticVersion(version);
            const isBetween = major > fromMajor && major <= toMajor;

            if (isBetween) {
                result.push(versionInfo);
            }
        }

        return result.filter((r) => !!r.breakingChangesDescription);
    }

    async release(
        zipFullPath: string,
        targetFileName: string,
        packageName: string,
        version: string,
        fileHash: string,
        breakingChangesDescription: string
    ) {
        const targetFullPath = path.resolve(this.registryPath, targetFileName);

        if (hasFile(targetFullPath)) {
            throw new Error('File already exists.');
        }

        copyFile(zipFullPath, targetFullPath);

        const packages = this.getPackages();
        const hasVersion = packages.find(
            (v) => v.packageName === packageName && v.version === version
        );

        if (hasVersion) {
            throw new Error(
                'Packages overview already has package registered.'
            );
        }

        const nextOverview: IPackagesOverview = {
            packages: [
                ...packages,
                {
                    packageName,
                    version,
                    fileName: targetFileName,
                    fileHash,
                    breakingChangesDescription,
                },
            ],
        };

        saveJsonFile(this.overviewPath, nextOverview);
    }

    async downloadRelease(
        packageName: string,
        version: string,
        targetFullPath: string
    ) {
        const packages = this.getPackages();
        const packageInfo = packages.find(
            (p) => p.packageName === packageName && p.version === version
        );

        if (!packageInfo) {
            throw new Error(
                `No such package in registry: ${packageName}@${version}`
            );
        }

        const sourceFullPath = path.resolve(
            this.registryPath,
            packageInfo.fileName
        );

        copyFile(sourceFullPath, targetFullPath);
    }
}
