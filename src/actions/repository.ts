import { ILogger } from '@empiriska/js-common-backend';

import { getAllOwnPackageJson } from '.';
import { environment } from './env';
import { CwdMover } from './process';

export const getAllEmpiriskaPackages = async (logger: ILogger) => {
    const { rootPath } = environment;

    const cwdMover = new CwdMover();
    cwdMover.moveTo(rootPath);

    const result = await getAllOwnPackageJson(logger);
    cwdMover.moveToOriginal();

    return result;
};
