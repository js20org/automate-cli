import path from 'path';
import os from 'os';

import {
    askForOption,
    askForOptionalString,
    fontBright,
    getJsonFileContent,
    hasFile,
    isValidDirectory,
    saveJsonFile,
} from '../utils';

import { IEnvironment, ILogger } from '../types';

enum RegistryType {
    LOCAL = 'local',
}

interface ILocalRegistry {
    type: RegistryType.LOCAL;
    registryPath: string;
}

type IRegistry = ILocalRegistry;

interface IConfig {
    registries: IRegistry[];
}

const CONFIG_FILE_NAME = '.emp-config.json';

const getConfigPath = () => {
    const homeDir = os.homedir();
    return path.resolve(homeDir, CONFIG_FILE_NAME);
};

const setupLocal = async (logger: ILogger): Promise<IRegistry> => {
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
    };

    saveJsonFile(configPath, config);

    return config;
};

const getConfigFile = async (logger: ILogger): Promise<IConfig> => {
    const configPath = getConfigPath();
    const hasConfig = hasFile(configPath);

    if (hasConfig) {
        return getJsonFileContent(configPath);
    } else {
        return await setupConfig(logger);
    }
};

export class Environment implements IEnvironment {
    private registries: IRegistry[];

    async initialize(logger: ILogger) {
        const config = await getConfigFile(logger);
        this.registries = config.registries;
    }

    getRegistries() {
        return this.registries;
    }
}
