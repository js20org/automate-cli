const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/index.ts'),
    },
    target: 'node',
    mode: 'development',
    plugins: [
        new DefinePlugin({
            CODE_VERSION: JSON.stringify('dev'),
        }),
    ],
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
