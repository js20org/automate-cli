import prompts from 'prompts';

export const askForOption = async (
    question: string,
    options: string[],
    defaultIndex?: number
): Promise<string> => {
    const initial = defaultIndex || 0;
    const choices = options.map(o => ({
        title: o,
        value: o
    }));

    const { answer } = await prompts({
        type: 'select',
        name: 'answer',
        message: question,
        choices,
        initial
    });

    const isValid = typeof answer === 'string' && options.includes(answer);

    if (!isValid) {
        throw new Error('Got invalid value from prompt.');
    }

    return answer;
};

export const askForBoolean = async (
    question: string,
    defaultValue?: boolean
) => {
    const initial = typeof defaultValue === 'boolean' ? defaultValue : false;

    const { answer } = await prompts({
        type: 'toggle',
        name: 'answer',
        message: question,
        initial,
        active: 'yes',
        inactive: 'no'
    });

    const isValid = typeof answer === 'boolean';

    if (!isValid) {
        throw new Error('Got invalid value from prompt.');
    }

    return answer;
};

export const askForOptionalString = async (
    question: string
) => {
    const { answer } = await prompts({
        type: 'text',
        name: 'answer',
        message: question,
    });

    const isValid = typeof answer === 'string';

    if (!isValid) {
        throw new Error('Got invalid value from prompt.');
    }

    return answer;
};

export const askForString = async (question: string) => {
    const { answer } = await prompts({
        type: 'text',
        name: 'answer',
        message: question,
        validate: (a: any) => a && a.length > 0,
    });

    const isValid = typeof answer === 'string';

    if (!isValid) {
        throw new Error('Got invalid value from prompt.');
    }

    return answer;
};
