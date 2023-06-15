import crypto from 'crypto';

export const getGeneratedSecret = () => {
    return crypto.randomBytes(256).toString('base64');
};
