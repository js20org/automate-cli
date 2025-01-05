import path from 'path';
import os from 'os';

import {
    ILogger,
    askForOption,
    askForOptionalString,
    fontBright,
    getJsonFileContent,
    hasFile,
    isValidDirectory,
    saveJsonFile,
} from '@js20/node-utils';

import { IConfig, IRegistry, IRegistryConfig, RegistryType } from '../types';

import { LocalRegistry } from '../registry';

const CONFIG_FILE_NAME = '.emp-config.json';

const getConfigPath = () => {
    const homeDir = os.homedir();
    return path.resolve(homeDir, CONFIG_FILE_NAME);
};

const setupLocal = async (logger: ILogger): Promise<IRegistryConfig> => {
    const homeDir = os.homedir();

    logger.log(
        `For a local registry your installed packages will be stored in a hidden folder on your machine.`
    );

    const rootPath = await askForOptionalString(
        `Where to place local registry? (Enter for default: ${homeDir})`
    );

    const actualPath = rootPath || homeDir;
    const isValid = isValidDirectory(actualPath);

    if (!isValid) {
        throw new Error('The provided path is not a valid directory.');
    }

    return {
        type: RegistryType.LOCAL,
        registryPath: actualPath,
    };
};

const getInitialRegistry = async (logger: ILogger, option: string) => {
    const isLocal = option === RegistryType.LOCAL;

    if (isLocal) {
        return setupLocal(logger);
    } else {
        return null;
    }
};

const setupConfig = async (logger: ILogger): Promise<IConfig> => {
    logger.log(fontBright("Hello from the emp command. Let's set it up!"));

    logger.log(
        'You need to chose your registry type. A local registry is stored only on your own machine.'
    );

    const option = await askForOption(
        'What type of registry do you want to use?',
        Object.values(RegistryType),
        0
    );

    const initialRegistry = await getInitialRegistry(logger, option);

    if (!initialRegistry) {
        throw new Error('Invalid initial registry.');
    }

    const configPath = getConfigPath();
    const config: IConfig = {
        registries: [initialRegistry],
        templateRoots: [],
    };

    saveJsonFile(configPath, config);

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

export const getRegistries = (config: IConfig): IRegistry[] => {
    const { registries } = config;

    return registries.map((r) => {
        const isLocal = r.type === RegistryType.LOCAL;

        if (isLocal) {
            return new LocalRegistry(r);
        } else {
            throw new Error('Unknown registry type.');
        }
    });
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
