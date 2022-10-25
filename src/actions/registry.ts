import { IEnvironment, IRegistry } from '../types';

const makeUserSelectRegistry = async (
    registries: IRegistry[]
): Promise<IRegistry> => {
    //TODO, not implemented yet.

    return null;
};

export const getSelectedRegistry = async (
    environment: IEnvironment
): Promise<IRegistry> => {
    const registries = environment.getRegistries();
    const hasMultipleRegistries = registries.length > 1;

    return hasMultipleRegistries
        ? await makeUserSelectRegistry(registries)
        : registries[0];
};
