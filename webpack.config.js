const path = require('path');

const entry = {
  omnicli: './src/index.ts',
};

if (process.env.NODE_ENV === 'development') {
  entry.omnitest = './omnitest/index.ts';
}

module.exports = {
  entry,
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
