const path = require("path");
const webpack = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const DEBUG =
  process.env.NODE_ENV === "development" || !!process.env.WEBPACK_HOT_RELOAD;

const plugins = [
  new webpack.ProvidePlugin({
    process: "process/browser"
  }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
    "process.env.PHONE_NUMBER_COUNTRY": `"${process.env.PHONE_NUMBER_COUNTRY ||
      "US"}"`
  }),
  new webpack.ContextReplacementPlugin(
    /[\/\\]node_modules[\/\\]timezonecomplete[\/\\]/,
    path.resolve("tz-database-context"),
    {
      tzdata: "tzdata"
    }
  )
];
const jsxLoaders = [{ loader: "babel-loader" }];
const assetsDir = process.env.ASSETS_DIR || "./build/client/assets";
const assetMapFile = process.env.ASSETS_MAP_FILE || "assets.json";
const outputFile = DEBUG ? "[name].js" : "[name].[fullhash].js";
console.log("Configuring Webpack with", {
  assetsDir,
  assetMapFile,
  outputFile
});

if (!DEBUG) {
  plugins.push(
    new WebpackManifestPlugin({
      fileName: assetMapFile,
      publicPath: ""
    })
  );
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  );
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

const config = {
  mode: ["development", "production"].includes(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : "none",
  entry: {
    bundle: ["babel-polyfill", "./src/client/index.jsx"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {
        test: /\.jsx?$/,
        use: jsxLoaders,
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  resolve: {
    alias: {
      // Redirect the v3 "react-router" specifier to our v6 compat shim so
      // that the ~48 existing files importing withRouter / Link from
      // "react-router" continue to work without individual rewrites.
      "react-router": path.resolve(__dirname, "../src/lib/router-compat.js")
    },
    fallback: {
      stream: require.resolve( "stream-browserify" ),
      zlib: require.resolve( "browserify-zlib" ),
      vm: require.resolve( "vm-browserify" )
    },
    mainFields: ["browser", "main", "module"],
    extensions: [".js", ".jsx", ".json"]
  },
  plugins,
  output: {
    filename: outputFile,
    path: path.resolve(DEBUG ? __dirname : assetsDir)
  },
  optimization: {
    minimize: !DEBUG,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false
        }
      })
    ]
  }
};

if (DEBUG) {
  config.devtool = "inline-source-map";
  config.output.sourceMapFilename = `${outputFile}.map`;
}

module.exports = config;
