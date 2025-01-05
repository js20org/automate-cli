import { ILogger } from '@js20/node-utils';

import { IConfig, IEnvironment, IResolvedTemplate } from '../types';
import { getConfigFile, getTemplates } from '../actions';

export class Environment implements IEnvironment {
    private isDebugMode: boolean;
    private config: IConfig | null = null;
    private templates: IResolvedTemplate[] | null = null;

    constructor(isDebugMode: boolean) {
        this.isDebugMode = isDebugMode;
    }

    async initialize(logger: ILogger) {
        this.config = await getConfigFile(logger);
        this.templates = getTemplates(logger, this.config);
    }

    isDebug() {
        return this.isDebugMode;
    }

    getConfig() {
        return this.config!;
    }

    getTemplates() {
        return this.templates!;
    }
}
