import {
    IConfig,
    IEnvironment,
    ILogger,
    IRegistry,
    IResolvedTemplate,
} from '../types';

import { getConfigFile, getRegistries, getTemplates } from '../actions';

export class Environment implements IEnvironment {
    private isDebugMode: boolean;
    private config: IConfig;
    private registries: IRegistry[];
    private templates: IResolvedTemplate[];

    constructor(isDebugMode: boolean) {
        this.isDebugMode = isDebugMode;
    }

    async initialize(logger: ILogger) {
        this.config = await getConfigFile(logger);
        this.registries = getRegistries(this.config);
        this.templates = getTemplates(this.config);

        for (const registry of this.registries) {
            await registry.initialize();
        }
    }

    isDebug() {
        return this.isDebugMode;
    }

    getConfig() {
        return this.config;
    }

    getRegistries() {
        return this.registries;
    }

    getTemplates() {
        return this.templates;
    }
}
