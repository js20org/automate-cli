import path from 'path';
import fs from 'fs';

import { glob } from 'glob';

import {
    IEnvironment,
    IFilesystemService,
    ILogger,
    IResolvedTemplate,
    ITemplateFiles,
    ITemplateQuestion,
    ITemplateVariable,
    TemplateQuestionType,
} from '../types';

import {
    FilesystemService,
    MockFilesystemService,
} from '../filesystem-service';

import {
    CommandExecutorService,
    MockCommandExecutorService,
} from '../command-executor-service';

import { askForBoolean, askForOption, askForString, fontDim } from '../utils';
import { verifyTemplateSetup } from '../actions';

const askSingleQuestion = async (
    userQuestion: string,
    type: TemplateQuestionType
) => {
    switch (type) {
        case TemplateQuestionType.STRING:
            return await askForString(userQuestion);
        case TemplateQuestionType.BOOLEAN:
            return await askForBoolean(userQuestion, true);
    }
};

const askQuestions = async (questions: ITemplateQuestion[]) => {
    const variables: ITemplateVariable[] = [];

    for (const templateQuestion of questions) {
        const { question: userQuestion, type, variable } = templateQuestion;
        const value = await askSingleQuestion(userQuestion, type);

        const next: ITemplateVariable = {
            value,
            variable,
        };

        variables.push(next);
    }

    return variables;
};

const areFilesIncluded = (
    variables: ITemplateVariable[],
    file: ITemplateFiles
) => {
    const { includeIf } = file;

    if (includeIf) {
        const variable = variables.find((v) => v.variable === includeIf);
        return variable?.value === true || variable?.value === 'true';
    } else {
        return true;
    }
};

const getFilesInDirectory = async (
    variables: ITemplateVariable[],
    fileGroup: ITemplateFiles,
    fullPath: string
) => {
    const isIncluded = areFilesIncluded(variables, fileGroup);

    if (!isIncluded) {
        return null;
    }

    return await glob(fullPath + '/**/*', {
        nodir: true,
    });
};

const getConvertedFileName = (fullPath: string) => {
    const fileName = path.basename(fullPath);
    const isHiddenFile = fileName.startsWith('_');

    if (isHiddenFile) {
        const convertedFileName = fileName.replace('_', '.');
        const directory = path.dirname(fullPath);

        return path.resolve(directory, convertedFileName);
    } else {
        return fullPath;
    }
};

const saveFiles = (
    filesystemService: IFilesystemService,
    allFiles: string[],
    variables: ITemplateVariable[],
    fullPath: string
) => {
    for (const file of allFiles) {
        let content = fs.readFileSync(file).toString();

        for (const variable of variables) {
            const { value, variable: key } = variable;

            //Replace all but the string provided is not a regex
            content = content.split(key).join(value + '');
        }

        const localPath = path.relative(fullPath, file);
        const targetPath = path.resolve(process.cwd(), localPath);
        const withConvertedFileName = getConvertedFileName(targetPath);

        filesystemService.saveFile(withConvertedFileName, content);
    }
};

const copyFiles = async (
    filesystemService: IFilesystemService,
    variables: ITemplateVariable[],
    rootPath: string,
    files: ITemplateFiles[]
) => {
    const allFiles = [];

    for (const fileGroup of files) {
        const fullPath = path.resolve(rootPath, fileGroup.path);
        const allFiles = await getFilesInDirectory(
            variables,
            fileGroup,
            fullPath
        );

        if (!allFiles) {
            continue;
        }

        const hasTooMany = allFiles.length > 250;

        if (hasTooMany) {
            throw new Error(
                'Too many files in folder. More than 250 files seems suspicious...'
            );
        }

        saveFiles(filesystemService, allFiles, variables, fullPath);
    }

    return [...new Set(allFiles)];
};

const generateProject = async (
    filesystemService: IFilesystemService,
    selectedTemplate: IResolvedTemplate
) => {
    const { questions, files, rootPath } = selectedTemplate;

    const variables = await askQuestions(questions);
    await copyFiles(filesystemService, variables, rootPath, files);
};

export const runNew = async (logger: ILogger, environment: IEnvironment) => {
    verifyTemplateSetup(logger, environment);

    const isDebugMode = environment.isDebug();

    const filesystemService = isDebugMode
        ? new MockFilesystemService(logger)
        : new FilesystemService(logger, false);

    const executorService = isDebugMode
        ? new MockCommandExecutorService(logger)
        : new CommandExecutorService(logger);

    if (isDebugMode) {
        logger.log(fontDim('Running with mock filesystem & executor calls...'));
        logger.log('');
    }

    const templates = environment.getTemplates();
    const templateNames = templates.map((p) => p.name);

    const selectedProjectName = await askForOption(
        'Select template to install:',
        templateNames
    );

    const selectedTemplate = templates.find(
        (p) => p.name === selectedProjectName
    );

    await generateProject(filesystemService, selectedTemplate);
    await executorService.execute('yarn install');
};
