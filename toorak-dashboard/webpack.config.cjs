const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require("path");

// Get environment variables or use defaults
const isProd = process.env.NODE_ENV === 'production';
// Define the URL of the remote's remoteEntry.js
const toorakAiUrl = isProd
  ? process.env.TOORAK_AI_URL || 'https://toorak-ai-url.com/remoteEntry.js'
  : 'http://localhost:5001/remoteEntry.js';

console.log('Using Toorak AI URL:', toorakAiUrl);

module.exports = {
  entry: "./src/index",
  mode: isProd ? "production" : "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 5000,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  output: {
    publicPath: "auto",
    filename: '[name].[contenthash].js',
    clean: isProd,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react", "@babel/preset-typescript"],
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: './postcss.config.cjs',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "toorakDashboard",
      remotes: {
        toorakAi: `toorak_ai@${toorakAiUrl}`,
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        "react-dom": { singleton: true, requiredVersion: '^19.0.0' },
        "react-router-dom": { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  optimization: isProd ? {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  } : undefined,
}; 