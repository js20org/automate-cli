import { fontDim, ILogger } from 'js-common-node';
import { IFilesystemService } from '../types';

export class MockFilesystemService implements IFilesystemService {
    private logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    createDirectory(fullPath: string) {
        this.logger.log(`Create directory: ${fullPath}`);
    }

    saveFile(fullPath: string, content: string) {
        const formattedContent = fontDim(content);
        this.logger.log(`\nFile "${fullPath}":\n${formattedContent}\n`);
    }
}
