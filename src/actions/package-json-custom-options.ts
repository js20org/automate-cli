import { ILogger } from '../types';
import { fontBright, fontDim, fontGreen, fontRed } from '../utils';

export enum CustomOption {
    TYPE,
    SHOULD_BE_RELEASED,
    NO_TESTS,
}

const WRAPPER_KEY = 'emp';

const isValidBoolean = (value: any) => {
    return typeof value === 'boolean';
};

const isValidNonEmptyString = (value: any) => {
    return value && typeof value === 'string' && value.length > 0;
};

interface IOption {
    type: CustomOption;
    packageJsonKey: string;
    valueDescription: string;
    defaultValue?: any;
    isValid: (value: any) => any;
}

const options: IOption[] = [
    {
        type: CustomOption.TYPE,
        packageJsonKey: 'type',
        valueDescription: 'String',
        isValid: isValidNonEmptyString,
    },
    {
        type: CustomOption.SHOULD_BE_RELEASED,
        packageJsonKey: 'release',
        valueDescription: 'Boolean',
        defaultValue: false,
        isValid: isValidBoolean,
    },
    {
        type: CustomOption.NO_TESTS,
        packageJsonKey: 'noTests',
        valueDescription: 'Boolean',
        defaultValue: false,
        isValid: isValidBoolean,
    },
];

const getCustomOption = (customOption: CustomOption) => {
    const option = options.find((o) => o.type === customOption);

    if (!option) {
        throw new Error(`No implementation for option: ${customOption}`);
    }

    return option;
};

export const getOptionDescription = (
    customOption: CustomOption,
    suggestedValue?: string
) => {
    const option = getCustomOption(customOption);
    const value = fontGreen(suggestedValue) || fontDim(option.valueDescription);

    return `
"emp": {
    "${option.packageJsonKey}": ${value}
}
`;
};

const getValidatedOptionValue = (
    logger: ILogger,
    packageJsonPath: string,
    option: IOption,
    value: any
) => {
    const isValid = option.isValid(value);
    const { defaultValue } = option;

    if (isValid) {
        return value;
    }

    const hasDefault = defaultValue !== undefined;

    if (hasDefault) {
        return defaultValue;
    } else {
        logger.log('Package.json had invalid option:');
        logger.log(packageJsonPath);
        logger.log(
            `\nExpected "${option.packageJsonKey}" to be of type "${option.valueDescription}"`
        );

        throw new Error('Invalid value type.');
    }
};

export const getOption = (
    logger: ILogger,
    packageJsonPath: string,
    packageJsonContent: Record<string, any>,
    customOption: CustomOption
) => {
    const option = getCustomOption(customOption);

    const wrapper = packageJsonContent[WRAPPER_KEY] || {};
    const value = wrapper[option.packageJsonKey];

    return getValidatedOptionValue(logger, packageJsonPath, option, value);
};

const validateOptionValue = (
    logger: ILogger,
    packageJsonPath: string,
    option: IOption,
    key: string,
    value: any
) => {
    const isValidByDefault =
        value === undefined && option.defaultValue !== undefined;
    const isValidByValue = value !== undefined && option.isValid(value);

    const isValid = isValidByDefault || isValidByValue;

    if (!isValid) {
        const formattedKey = fontBright(key);
        logger.log(packageJsonPath);

        throw new Error(
            `Invalid value for key ${formattedKey}. Expected: ${option.valueDescription}`
        );
    }
};

export const assertAllOptionsOk = (
    logger: ILogger,
    packageJsonPath: string,
    packageJsonContent: Record<string, any>
) => {
    const availableOptions = fontDim(
        options.map((o) => o.packageJsonKey).join(', ')
    );

    const wrapper = packageJsonContent[WRAPPER_KEY] || {};
    const usedKeys = Object.keys(wrapper);

    for (const key of usedKeys) {
        const value = wrapper[key];
        const option = options.find((o) => o.packageJsonKey === key);

        if (!option) {
            const errorKey = fontRed(key);
            logger.log(packageJsonPath);

            throw new Error(
                `No such emp option ${errorKey} exist. Available options are: ${availableOptions}`
            );
        }

        validateOptionValue(logger, packageJsonPath, option, key, value);
    }

    for (const option of options) {
        const value = wrapper[option.packageJsonKey];

        validateOptionValue(
            logger,
            packageJsonPath,
            option,
            option.packageJsonKey,
            value
        );
    }
};
