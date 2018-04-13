const path = require("path");
const { CheckerPlugin } = require("awesome-typescript-loader");
const { TSDeclerationsPlugin } = require("ts-loader-decleration");

const entry = {
  omnicli: "./src/index.ts"
};

if (process.env.NODE_ENV === "development") {
  entry.omnitest = "./omnitest/index.ts";
}

const config = {
  entry,
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.ts$/,
        use: "tslint-loader",
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        use: "awesome-typescript-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    library: ["omnicli", "[name]"],
    libraryTarget: "umd"
  },
  plugins: [
    new CheckerPlugin(),
    new TSDeclerationsPlugin({
      main: "src/index.d.ts",
      out: "omnicli.d.ts"
    })
  ]
};

if (process.env.NODE_ENV === "development") {
  config.devtool = "inline-source-map";
}

module.exports = config;
