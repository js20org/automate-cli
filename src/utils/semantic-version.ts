import { ISemanticVersion } from '../types';

export const getExtractedSemanticVersion = (path: string) => {
    const match = path.match(/([0-9]+).([0-9]+).([0-9]+)/);

    if (!match) {
        throw new Error(
            `The string "${path}" does not contain a semantic-version.`
        );
    }

    const [, a, b, c] = match;
    return `${a}.${b}.${c}`;
};

export const getParsedSemanticVersion = (version: string): ISemanticVersion => {
    const match = version.match(/^([0-9]+).([0-9]+).([0-9]+)$/);

    if (!match) {
        throw new Error(
            `The string "${version}" is not a valid semantic-version.`
        );
    }

    const [, a, b, c] = match;

    const major = parseInt(a);
    const minor = parseInt(b);
    const patch = parseInt(c);

    return {
        major,
        minor,
        patch,
    };
};

export const getSerializedSemanticVersion = (version: ISemanticVersion) => {
    const { major, minor, patch } = version;

    return `${major}.${minor}.${patch}`;
};

export const compareSemanticVersion = (
    a: ISemanticVersion,
    b: ISemanticVersion
) => {
    const { major: aMajor, minor: aMinor, patch: aPatch } = a;

    const { major: bMajor, minor: bMinor, patch: bPatch } = b;

    if (aMajor !== bMajor) return aMajor - bMajor;
    if (aMinor !== bMinor) return aMinor - bMinor;

    return aPatch - bPatch;
};

export const getLargestSemanticVersion = (a: string, b: string) => {
    const compareValue = compareSemanticVersion(
        getParsedSemanticVersion(a),
        getParsedSemanticVersion(b)
    );

    const isALarger = compareValue > 0;
    return isALarger ? a : b;
};
