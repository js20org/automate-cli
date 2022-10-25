import { ExecException } from 'child_process';

export interface ICommit {
    id: string;
    message: string;
    author: string;
    date: string;
}

export interface IChangelogEntry {
    version: string;
    date?: string;
    breakingChanges: string;
    commits?: ICommit[];
    entries?: string[];
}

export interface IChangelog {
    name: string;
    versions: IChangelogEntry[];
}

export interface IReleaseOverviewPackage {
    name: string;
    latestVersion: string;
}

export interface IReleaseOverview {
    packages?: IReleaseOverviewPackage[];
}

export interface IEnv {
    rootPath: string;
}

export interface ISemanticVersion {
    major: number;
    minor: number;
    patch: number;
}

export interface IExecuteResult {
    error: ExecException;
    combinedOut: string;
}

export interface ICommand {
    subcommand: string;
    description: string;
    run: (logger: ILogger, environment: IEnvironment) => Promise<any>;
}

export interface ILogger {
    log: (message: any) => void;
    logVerbose: (message: any) => void;
}

export abstract class Logger implements ILogger {
    abstract log(message: any): void;
    abstract logVerbose(message: any): void;
}

export interface IRegistry {
    initialize(): Promise<void>;

    getAllPackageNames(): Promise<string[]>;
    getPackageLatestVersion(packageName: string): Promise<IPackageVersion>;
    hasRelease(fileName: string): Promise<boolean>;

    release(
        zipFullPath: string,
        targetFileName: string,
        packageName: string,
        version: string,
        fileHash: string,
        breakingChangesDescription: string
    ): Promise<void>;

    downloadRelease(
        packageName: string,
        version: string,
        targetFullPath: string
    ): Promise<void>;
}

export interface IEnvironment {
    initialize(logger: ILogger): Promise<void>;
    getRegistries(): IRegistry[];
}

export enum RegistryType {
    LOCAL = 'local',
}

export interface IRegistryConfigLocal {
    type: RegistryType.LOCAL;
    registryPath: string;
}

export type IRegistryConfig = IRegistryConfigLocal;

export interface IConfig {
    registries: IRegistryConfig[];
}

export interface IPackageVersion {
    packageName: string;
    fileName: string;
    version: string;
    fileHash: string;
    breakingChangesDescription: string;
}

export enum DependencyType {
    DEPENDENCIES = 'dependencies',
    DEV_DEPENDENCIES = 'devDependencies',
}
