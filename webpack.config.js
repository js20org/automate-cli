const path = require('path');

module.exports = {
    mode: 'production',
    target: 'node',
    entry: {
        main: path.resolve(__dirname, './src/index.ts'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules\/.*/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
        ],
    },
};
