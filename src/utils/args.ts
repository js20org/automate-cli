import { ICommand, IEnvironment, ILogger } from '../types';
import { fontBright, fontGreen } from './font';

const showHelp = (logger: ILogger, commands: ICommand[]) => {
    const items = commands
        .map((c) => `  ${fontBright(c.subcommand)}: \n    ${c.description}`)
        .join('\n');

    logger.log(`The following commands are available:\n\n${items}`);
};

export const handleArgs = async (
    logger: ILogger,
    environment: IEnvironment,
    commands: ICommand[]
) => {
    const args = process.argv.slice(2);
    const shouldShowHelp = args.includes('--help');

    if (shouldShowHelp) {
        return showHelp(logger, commands);
    }

    const hasArgs = args.length > 0;

    if (!hasArgs) {
        return logger.log(
            'No arguments provided. Try the "--help" command to get started.'
        );
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
