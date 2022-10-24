import { isValidDirectory } from './file';
import { IEnv } from '../types';

const getRootDirectory = () => {
    const rootDirectory = process.env.EMP_RELEASE_ROOT;
    const isValidRootDirectory =
        rootDirectory && isValidDirectory(rootDirectory);

    if (!isValidRootDirectory) {
        throw new Error(
            'Expected "EMP_RELEASE_ROOT" to be set with a valid directory path.'
        );
    }

    return rootDirectory;
};

export const environment: IEnv = {
    rootPath: getRootDirectory()
};
