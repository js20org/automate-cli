import { IFilesystemService, ILogger } from '../types';
import { fontDim } from '../utils';

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
