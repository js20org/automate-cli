import { getAllOwnPackageJson } from '.';
import { ILogger } from '../types';
import { environment } from './env';
import { CwdMover } from './process';

export const moveAndFindAllOwnPackageJson = async (logger: ILogger) => {
    const { rootPath } = environment;

    const cwdMover = new CwdMover();
    cwdMover.moveTo(rootPath);

    const result = await getAllOwnPackageJson(logger);
    cwdMover.moveToOriginal();

    return result;
};
