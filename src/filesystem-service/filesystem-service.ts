import fs from 'fs';
import path from 'path';
import { ILogger } from '@js20/node-utils';

import { IFilesystemService } from '../types';

export class FilesystemService implements IFilesystemService {
    private logger: ILogger;
    private isAllowedToOverwrite: boolean;

    constructor(logger: ILogger, isAllowedToOverwrite: boolean) {
        this.logger = logger;
        this.isAllowedToOverwrite = isAllowedToOverwrite;
    }

    getTargetPath(relativePath: string) {
        return path.resolve(process.cwd(), relativePath);
    }

    createDirectory(relativePath: string) {
        const target = this.getTargetPath(relativePath);
        const hasTarget = fs.existsSync(target);

        if (hasTarget) {
            return;
        }

        fs.mkdirSync(target);
    }

    saveFile(relativePath: string, content: string) {
        const target = this.getTargetPath(relativePath);
        const directoryName = path.dirname(target);
        const hasTarget = fs.existsSync(target);
        const shouldWrite = this.isAllowedToOverwrite || !hasTarget;

        if (shouldWrite) {
            fs.mkdirSync(directoryName, { recursive: true });
            fs.writeFileSync(target, content);
        } else {
            this.logger.log(`Prevented write to existing file: ${target}`);
        }
    }
}
