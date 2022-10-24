import { Logger } from '../types';

export class DefaultLogger extends Logger {
    private shouldLogVerbose: boolean;

    constructor(shouldLogVerbose: boolean) {
        super();
        this.shouldLogVerbose = shouldLogVerbose;
    }

    log(message: any) {
        console.log(message);
    }

    logVerbose(message: any) {
        if (this.shouldLogVerbose) {
            console.log(message);
        }
    }
}
