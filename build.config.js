const { build } = require('esbuild');
const { version } = require('./package.json');

build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    platform: 'node',
    outfile: './dist/bundle.js',
    target: 'node16',
    minify: true,
    define: {
        CODE_VERSION: JSON.stringify(version),
    },
}).catch(() => process.exit(1));
