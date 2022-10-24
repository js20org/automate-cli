export class CwdMover {
    private originalDir: string;

    constructor() {
        this.originalDir = process.cwd();
    }

    getOriginalDirectory() {
        return this.originalDir;
    }

    moveTo(folder: string) {
        process.chdir(folder);
    }

    moveToOriginal() {
        process.chdir(this.originalDir);
    }
}
