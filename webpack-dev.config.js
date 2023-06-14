const path = require('path');

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/index.ts'),
    },
    target: 'node',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig-dev.json',
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    externalsPresets: {
        node: true,
    },
    output: {
        filename: 'dev.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: "source-map"
};
