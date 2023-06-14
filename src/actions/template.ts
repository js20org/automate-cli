import path from 'path';

import {
    IConfig,
    IEnvironment,
    ILogger,
    IResolvedTemplate,
    ITemplate,
} from '../types';
import { fontDim, getJsonFileContent, hasFile } from '../utils';

const TEMPLATES_ROOT_FILE_NAME = 'templates.json';

export const verifyTemplateSetup = (
    logger: ILogger,
    environment: IEnvironment
) => {
    const templates = environment.getTemplates();
    const hasTemplates = templates.length > 0;

    if (!hasTemplates) {
        logger.log('');
        logger.log('No templates have been setup. Please run the command:');
        logger.log(fontDim('emp template-setup'));
        logger.log('');

        throw new Error('No templates have been setup.');
    }
};

export const getTemplates = (config: IConfig): IResolvedTemplate[] => {
    const { templateRoots } = config;

    return templateRoots
        .map((r) => {
            const templatePath = path.resolve(r, TEMPLATES_ROOT_FILE_NAME);
            const hasRootFile = hasFile(templatePath);

            if (!hasRootFile) {
                console.log('');
                console.log('Template root: ' + fontDim(r));

                throw new Error(
                    `Your template root folder must have a file named "${TEMPLATES_ROOT_FILE_NAME}". Please consider the README for more info."`
                );
            }

            const templates = getJsonFileContent(templatePath) as ITemplate[];
            const resolved: IResolvedTemplate[] = templates.map((t) => ({
                ...t,
                rootPath: r,
            }));

            return resolved;
        })
        .flat(1);
};
