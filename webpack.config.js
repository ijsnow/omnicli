const path = require('path');
const {CheckerPlugin} = require('awesome-typescript-loader');

const entry = {
  omnicli: './src/index.ts',
};

if (process.env.NODE_ENV === 'development') {
  entry.omnitest = './omnitest/index.ts';
}

const config = {
  entry,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new CheckerPlugin()],
};

if (process.env.NODE_ENV === 'development') {
  config.devtool = 'inline-source-map';
}

module.exports = config;
