import {
    ILogger,
    fontBright,
    fontDim,
    fontGreen,
    fontRed,
} from '@js20/node-utils';

export enum CustomOption {
    SHOULD_BE_RELEASED,
}

const isValidBoolean = (value: any) => {
    return typeof value === 'boolean';
};

interface IOption {
    type: CustomOption;
    packageJsonKey: string;
    valueDescription: string;
    defaultValue?: any;
    isValid: (value: any) => any;
}

const OPTIONS: IOption[] = [
    {
        type: CustomOption.SHOULD_BE_RELEASED,
        packageJsonKey: 'empRelease',
        valueDescription: 'Boolean',
        defaultValue: false,
        isValid: isValidBoolean,
    },
];

const getCustomOption = (customOption: CustomOption) => {
    const option = OPTIONS.find((o) => o.type === customOption);

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
"${option.packageJsonKey}": ${value}
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
    const value = packageJsonContent[option.packageJsonKey];

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
        logger.log(fontRed('[package.json not configured]'));

        logger.log(
            fontBright(
                'Your package was not configured with the right settings.'
            )
        );
        logger.log(
            fontDim(
                'In your package.json you need to place the correct settings inside of "emp":\n{\n\t"emp": {...}\n}\n'
            )
        );

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
    for (const option of OPTIONS) {
        const value = packageJsonContent[option.packageJsonKey];

        validateOptionValue(
            logger,
            packageJsonPath,
            option,
            option.packageJsonKey,
            value
        );
    }
};
