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

    hasRelease(fileName: string): Promise<boolean>;
    getAllPackageNames(): Promise<string[]>;
    getPackageLatestVersion(packageName: string): Promise<IPackageVersion>;
    getBreakingChangesBetweenVersions(
        packageName: string,
        from: string,
        to: string
    ): Promise<IPackageVersion[]>;

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

export enum TemplateQuestionType {
    STRING = 'string',
    BOOLEAN = 'boolean',
}

export interface ITemplateQuestion {
    type: TemplateQuestionType;
    question: string;
    variable: string;
}

export interface ITemplateFiles {
    path: string;
    includeIf: string;
}

export interface ITemplate {
    name: string;
    questions: ITemplateQuestion[];
    files: ITemplateFiles[];
}

export interface IResolvedTemplate extends ITemplate {
    rootPath: string;
}

export interface ITemplateVariable {
    variable: string;
    value: string | boolean;
}

export interface IEnvironment {
    initialize(logger: ILogger): Promise<void>;

    isDebug(): boolean;
    getConfig(): IConfig;
    getRegistries(): IRegistry[];
    getTemplates(): IResolvedTemplate[];
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
    templateRoots: string[];
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

export interface IFilesystemService {
    createDirectory: (relativePath: string) => void;
    saveFile: (relativePath: string, content: string) => void;
}

export interface ICommandExecutor {
    execute: (command: string) => Promise<any>;
}
