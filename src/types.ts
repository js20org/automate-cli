import { ILogger } from '@js20/node-utils';

export interface ICommand {
    subcommand: string;
    description: string;
    run: (logger: ILogger, environment: IEnvironment) => Promise<any>;
}

export enum TemplateQuestionType {
    STRING = 'string',
    BOOLEAN = 'boolean',
}

export interface ITemplateQuestion {
    type: TemplateQuestionType;
    question: string;
    variable: string;
    askIf?: string;
}

export interface ITemplateFiles {
    path: string;
    includeIf: string;
}

export enum GeneratedVariableType {
    CRYPTO_SECRET = 'cryptoSecret',
}

export interface IGeneratedVariable {
    type: GeneratedVariableType;
    variable: string;
}

export interface ITemplate {
    name: string;
    questions: ITemplateQuestion[];
    generated: IGeneratedVariable[];
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
    getTemplates(): IResolvedTemplate[];
}

export interface IConfig {
    templateRoots: string[];
}

export interface IFilesystemService {
    createDirectory: (relativePath: string) => void;
    saveFile: (relativePath: string, content: string) => void;
}
