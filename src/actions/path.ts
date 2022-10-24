import path from 'path';

export const getCwdPath = (filename: string) => {
    return path.resolve(process.cwd(), filename);
};
