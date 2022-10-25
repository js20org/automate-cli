import fs from 'fs';
import crypto from 'crypto';

const getHash = (absolutePath: string, callback: (hash: string) => void) => {
    //Inspired by https://stackoverflow.com/a/18658613

    const stream = fs.createReadStream(absolutePath);
    const hash = crypto.createHash('sha1');

    hash.setEncoding('hex');

    stream.on('end', function () {
        hash.end();

        const result: string = hash.read();
        callback(result);
    });

    stream.pipe(hash);
};

export const getFileHash = async (absolutePath: string): Promise<string> => {
    return new Promise((resolve) => getHash(absolutePath, resolve));
};
