module.exports = {
  plugins: [
    require('./scripts/validate-svg'),
    '@svgr/plugin-svgo',
    '@svgr/plugin-jsx',
    '@svgr/plugin-prettier',
  ],
  typescript: true,
  icon: true,
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
