
module.exports = {
    source: ['tokens/**/*.json'],
    platforms: {
        css: {
            transformGroup: 'css',
            buildPath: 'dist/css/',
            files: [{
                destination: 'tokens.css',
                format: 'css/variables'
            }]
        },
        src: {
            transformGroup: 'js',
            buildPath: 'src/generated/',
            files: [
                {
                    destination: 'tokens.ts',
                    format: 'javascript/es6',
                }
            ]
        },
        ts: {
            transformGroup: 'js',
            buildPath: 'dist/ts/',
            files: [
                {
                    destination: 'tokens.ts',
                    format: 'javascript/es6',
                },
                {
                    destination: 'tokens.d.ts',
                    format: 'typescript/es6-declarations',
                }
            ]
        }
    }
};
