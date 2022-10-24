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
    run: (logger: ILogger) => Promise<any>;
}

export interface ILogger {
    log: (message: any) => void;
    logVerbose: (message: any) => void;
}

export abstract class Logger implements ILogger {
    abstract log(message: any): void;
    abstract logVerbose(message: any): void;
}
