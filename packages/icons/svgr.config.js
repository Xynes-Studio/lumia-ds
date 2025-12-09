module.exports = {
    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
    typescript: true,
    icon: true,
    outDir: 'src/generated',
    runtimeConfig: false,
    svgoConfig: {
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        removeViewBox: false,
                    },
                },
            },
            'prefixIds',
        ],
    },
};
