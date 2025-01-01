import { ILogger, fontBright, fontGreen } from 'js-common-node';

import { Environment } from '../environment';
import { ICommand } from '../types';

const showHelp = (logger: ILogger, commands: ICommand[], codeVersion: string) => {
    const items = commands
        .map((c) => `  ${fontBright(c.subcommand)}: \n    ${c.description}`)
        .join('\n');

    logger.log(`@js20/automate-cli (${codeVersion}). The following commands are available:\n\n${items}`);
};

export const handleArgs = async (logger: ILogger, commands: ICommand[], codeVersion: string) => {
    const args = process.argv.slice(2);
    const shouldShowHelp = args.includes('--help');

    if (shouldShowHelp) {
        return showHelp(logger, commands, codeVersion);
    }

    const isDebugMode = args.includes('--debug');
    const environment = new Environment(isDebugMode);

    await environment.initialize(logger);
    const hasArgs = args.length > 0;

    if (!hasArgs) {
        return logger.log(
            'No arguments provided. Try the "--help" command to get started.'
        );
    }

    logger.log('');

    if (isDebugMode) {
        logger.log('[Debug mode enabled]');
    }

    const command = commands.find((c) => args.includes(c.subcommand));

    if (command) {
        await command.run(logger, environment);
    } else {
        const subcommands = commands
            .map((c) => fontGreen(c.subcommand))
            .join(', ');
        logger.log(
            `Invalid subcommand provided!\n\nPlease choose one of [${subcommands}]`
        );
    }
};
