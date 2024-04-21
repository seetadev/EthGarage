const { ProvidePlugin } = require('webpack');
require('dotenv').config({ path: `.env` });

module.exports = function(config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        { test: /\.(m?js|ts)$/, enforce: 'pre', use: ['source-map-loader'] },
        { test: /\.m?js/, type: 'javascript/auto', resolve: { fullySpecified: false } },
        { test: /\.json$/, type: 'json' }
      ]
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({ process: 'process/browser' }),
      new ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })
    ],
    resolve: {
      ...config.resolve,
      fallback: {
        buffer: require.resolve('buffer'),
        assert: false,
        stream: false,
        crypto: false,
        os: false,
        fs: false,
        path: false
      }
    },
    ignoreWarnings: [/Failed to parse source map/]
  };
};
