import path from 'path';
import glob from 'glob';

export const getFilesRecursivelyWithoutNodeModules = async (
    filePattern: string
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        glob(
            `**/*${filePattern}`,
            {
                ignore: ['**/node_modules/**'],
            },
            (error, matches) => {
                if (error) {
                    reject(error);
                } else {
                    const safeMatches = matches || [];
                    const fullPaths = safeMatches.map((m) =>
                        path.resolve(process.cwd(), m)
                    );

                    resolve(fullPaths);
                }
            }
        );
    });
};
