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
