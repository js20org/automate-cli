import path from 'path';
import fs from 'fs';

import { glob } from 'glob';

import {
    GeneratedVariableType,
    IEnvironment,
    IFilesystemService,
    IGeneratedVariable,
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

import {
    askForBoolean,
    askForOption,
    askForString,
    fontDim,
    getGeneratedSecret,
} from '../utils';
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

const shouldAskQuestion = (askIf: string, variables: ITemplateVariable[]) => {
    if (!askIf) {
        return true;
    }

    const variable = variables.find((v) => v.variable === askIf);
    return variable?.value === true;
};

const askQuestions = async (questions: ITemplateQuestion[]) => {
    const variables: ITemplateVariable[] = [];

    for (const templateQuestion of questions) {
        const {
            question: userQuestion,
            type,
            variable,
            askIf,
        } = templateQuestion;

        const shouldAsk = shouldAskQuestion(askIf, variables);
        const value = shouldAsk
            ? await askSingleQuestion(userQuestion, type)
            : '';

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
    const shouldConvert = fileName.startsWith('_');

    if (shouldConvert) {
        const convertedFileName = fileName.replace(/^_/, '');
        const directory = path.dirname(fullPath);

        return path.resolve(directory, convertedFileName);
    } else {
        return fullPath;
    }
};

const getReplacedIfStatements = (
    content: string,
    variables: ITemplateVariable[]
) => {
    const lines = content.split('\n');
    const result = [];

    let isAddingLines = true;

    for (const line of lines) {
        const isIfEnd = line.includes('-- endif --');

        if (isIfEnd) {
            isAddingLines = true;
            continue;
        }

        let isIfLine = false;

        for (const variable of variables) {
            const { variable: key, value } = variable;
            const isIfStart = line.includes(`-- if ${key} ===`);

            if (!isIfStart) {
                continue;
            }

            isIfLine = true;

            const stringValue = value + '';
            const isIfMatch = line.includes(
                `-- if ${key} === ${stringValue} --`
            );

            if (isIfMatch) {
                isAddingLines = true;
            } else {
                isAddingLines = false;
            }

            break;
        }

        const shouldAdd = isAddingLines && !isIfLine;

        if (shouldAdd) {
            result.push(line);
        }
    }

    return result.join('\n');
};

const getReplacedVariables = (
    content: string,
    variables: ITemplateVariable[]
) => {
    let next = content;

    for (const variable of variables) {
        const { value, variable: key } = variable;

        //Replace-all, but the string provided is not a regex
        next = next.split(key).join(value + '');
    }

    return next;
};

const getGeneratedValue = (type: GeneratedVariableType) => {
    switch (type) {
        case GeneratedVariableType.CRYPTO_SECRET:
            return getGeneratedSecret();
        default:
            throw new Error(
                'No implementation for generated variable type: ' + type
            );
    }
};

const getGeneratedVariables = (
    content: string,
    generated: IGeneratedVariable[]
) => {
    let next = content;

    for (const variable of generated) {
        const { type, variable: key } = variable;
        const value = getGeneratedValue(type);

        //Replace-all, but the string provided is not a regex
        next = next.split(key).join(value + '');
    }

    return next;
};

const getValidJson = (content: string) => {
    const isJsonStart = content.startsWith('{');
    const isJsonEnd = content.endsWith('}') || content.endsWith('}\n');

    const isJson = isJsonStart && isJsonEnd;

    if (!isJson) {
        return content;
    }

    //Inspired by: https://stackoverflow.com/a/34347475
    const replaceRegex = /\,(?!\s*?[\{\[\"\'\w])/g;

    return content.replace(replaceRegex, '');
};

const saveFiles = (
    filesystemService: IFilesystemService,
    allFiles: string[],
    variables: ITemplateVariable[],
    generated: IGeneratedVariable[],
    fullPath: string
) => {
    for (const file of allFiles) {
        const content = fs.readFileSync(file).toString();

        const contentWithReplacedIfs = getReplacedIfStatements(
            content,
            variables
        );

        const contentWithReplacedVariables = getReplacedVariables(
            contentWithReplacedIfs,
            variables
        );

        const contentWithGeneratedVariables = getGeneratedVariables(
            contentWithReplacedVariables,
            generated
        );

        const contentWithValidJson = getValidJson(
            contentWithGeneratedVariables
        );

        const localPath = path.relative(fullPath, file);
        const targetPath = path.resolve(process.cwd(), localPath);
        const pathWithConvertedFileName = getConvertedFileName(targetPath);

        filesystemService.saveFile(
            pathWithConvertedFileName,
            contentWithValidJson
        );
    }
};

const copyFiles = async (
    filesystemService: IFilesystemService,
    variables: ITemplateVariable[],
    generated: IGeneratedVariable[],
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

        saveFiles(filesystemService, allFiles, variables, generated, fullPath);
    }

    return [...new Set(allFiles)];
};

const generateProject = async (
    filesystemService: IFilesystemService,
    selectedTemplate: IResolvedTemplate
) => {
    const { questions, generated, files, rootPath } = selectedTemplate;

    const variables = await askQuestions(questions);
    await copyFiles(filesystemService, variables, generated, rootPath, files);
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
