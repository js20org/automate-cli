import path from 'path';
import os from 'os';

import {
    ILogger,
    fontBright,
    getJsonFileContent,
    hasFile,
    saveJsonFile,
} from '@js20/node-utils';

import { IConfig } from '../types';

const CONFIG_FILE_NAME = '.emp-config.json';

const getConfigPath = () => {
    const homeDir = os.homedir();
    return path.resolve(homeDir, CONFIG_FILE_NAME);
};

const setupConfig = async (logger: ILogger): Promise<IConfig> => {
    logger.log(fontBright("Initializing emp config..."));

    const configPath = getConfigPath();
    const config: IConfig = {
        templateRoots: [],
    };

    saveJsonFile(configPath, config);

    logger.log(fontBright("Initialize done."));

    return config;
};

export const getConfigFile = async (logger: ILogger): Promise<IConfig> => {
    const configPath = getConfigPath();
    const hasConfig = hasFile(configPath);

    if (hasConfig) {
        return getJsonFileContent(configPath);
    } else {
        return await setupConfig(logger);
    }
};

export const addTemplateRoot = (nextPath: string) => {
    const configPath = getConfigPath();
    const hasConfig = hasFile(configPath);

    if (!hasConfig) {
        throw new Error('No config exists.');
    }

    const config = getJsonFileContent(configPath) as IConfig;
    const nextConfig: IConfig = {
        ...config,
        templateRoots: [...config.templateRoots, nextPath],
    };

    saveJsonFile(configPath, nextConfig);
};
