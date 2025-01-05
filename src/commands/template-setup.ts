import {
    askForString,
    fontBright,
    fontDim,
    isValidDirectory,
    ILogger,
} from '@js20/node-utils';

import { IEnvironment } from '../types';
import { addTemplateRoot, getCwdPath } from '../actions';

export const runTemplateSetup = async (
    logger: ILogger,
    environment: IEnvironment
) => {
    logger.log('');
    logger.log(fontBright('[Template setup]'));
    logger.log(
        'This command is used to setup a new root directory containing project templates.'
    );
    logger.log('Please consider the the README for more information.');
    logger.log('');

    const userPath = await askForString(
        'Provide a path to the root directory where your templates are located:'
    );

    const { templateRoots } = environment.getConfig();

    logger.log('');
    logger.log('Existing setup template roots:');

    for (const root of templateRoots) {
        logger.log(' - ' + root);
    }

    const fullPath = getCwdPath(userPath);
    const isDirectory = isValidDirectory(fullPath);

    logger.log('');
    logger.log(`Provided path: ${fontDim(userPath)}`);
    logger.log(`Resolved path: ${fontDim(fullPath)}`);
    logger.log('');

    if (!isDirectory) {
        throw new Error('The path you provided is not a valid directory path.');
    }

    const hasRoot = templateRoots.includes(fullPath);

    if (hasRoot) {
        logger.log('');
        logger.log('The template root was already setup. Nothing was changed.');
    } else {
        addTemplateRoot(fullPath);

        logger.log('');
        logger.log('✅ Template root added successfully.');
    }
};
