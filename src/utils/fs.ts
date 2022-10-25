import fs from 'fs';

const readJsonFile = <T>(absolutePath: string) => {
    const content = fs.readFileSync(absolutePath).toString();
    return <T>JSON.parse(content);
};

export const saveJsonFile = (absolutePath: string, content: Record<string, any>) => {
    fs.writeFileSync(absolutePath, JSON.stringify(content, null, 4));
};

export const getJsonFileContent = <T>(absolutePath: string): T => {
    const hasFile = fs.existsSync(absolutePath);

    if (!hasFile) {
        throw new Error(`Expected a file '${absolutePath}' to exist.`);
    }

    return readJsonFile(absolutePath);
};

export const getOrCreateJsonFile = <T>(absolutePath: string): T => {
    const hasFile = fs.existsSync(absolutePath);

    if (hasFile) {
        return readJsonFile(absolutePath);
    }

    saveJsonFile(absolutePath, {});
    return <T>{};
};

export const createDirectoryIfNotExists = (absolutePath: string) => {
    const hasDir = fs.existsSync(absolutePath);

    if (!hasDir) {
        fs.mkdirSync(absolutePath);
    }
};

export const hasFile = (absolutePath: string) => {
    return fs.existsSync(absolutePath);
};

export const assertFileExists = (absolutePath: string) => {
    const doesExist = fs.existsSync(absolutePath);

    if (!doesExist) {
        throw new Error(`No such file exists: ${absolutePath}`);
    }
};

export const moveFile = (
    sourcePath: string,
    targetPath: string,
    sanityCheckEnding: string
) => {
    fs.copyFileSync(sourcePath, targetPath);
    const wasSuccessful = fs.existsSync(targetPath);

    if (!wasSuccessful) {
        throw new Error('Failed to copy file.');
    }

    const hasCorrectEnding =
        sanityCheckEnding.startsWith('.') && sourcePath.endsWith(sanityCheckEnding);

    if (hasCorrectEnding) {
        fs.unlinkSync(sourcePath);
    } else {
        throw new Error(
            `File ending sanity check failed: File "${sourcePath}, ending: "${sanityCheckEnding}"`
        );
    }
};

export const isValidDirectory = (absolutePath: string) => {
    return fs.lstatSync(absolutePath).isDirectory();
};
