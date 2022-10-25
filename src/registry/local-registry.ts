import path from 'path';

import { IRegistry, IRegistryConfigLocal } from '../types';
import {
    copyFile,
    createDirectoryIfNotExists,
    getOrCreateJsonFile,
    hasFile,
    saveJsonFile,
} from '../utils';

const LOCAL_REGISTRY_FOLDER_NAME = '.emp-registry';
const PACKAGES_OVERVIEW_FILE_NAME = '.packages.json';

interface IPackageVersion {
    packageName: string;
    fileName: string;
    version: string;
    fileHash: string;
    breakingChangesDescription: string;
}

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

    async initialize() {
        createDirectoryIfNotExists(this.registryPath);
    }

    async hasRelease(fileName: string) {
        const fullPath = path.resolve(this.registryPath, fileName);
        return hasFile(fullPath);
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

        const overview = getOrCreateJsonFile<IPackagesOverview>(
            this.overviewPath
        );

        const packages = overview.packages || [];
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
}
