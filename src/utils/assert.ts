import { isValidString } from './validation';

export const assert = (isValid: boolean, errorMessage: string) => {
    if (!isValid) {
        throw new Error(errorMessage);
    }
};

export const assertIsString = (value: any) => {
    const isValid = isValidString(value);
    assert(isValid, 'Expected value value to be a string');
};
