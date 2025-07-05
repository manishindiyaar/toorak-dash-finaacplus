const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

// Get environment variables or use defaults
const isProd = process.env.NODE_ENV === 'production';
const publicPath = isProd
  ? process.env.PUBLIC_PATH || 'auto'
  : 'auto';

module.exports = {
  entry: './src/index',
  mode: isProd ? 'production' : 'development',
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 5001, // Port for the remote app
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  output: {
    publicPath: publicPath,
    filename: isProd ? '[name].[contenthash].js' : '[name].js',
    clean: isProd,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            '@babel/preset-react',
            '@babel/preset-typescript'
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: './postcss.config.cjs',
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'toorak_ai',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' }
      },
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      templateParameters: {
        title: 'Toorak AI',
      },
    }),
  ],
  optimization: isProd ? {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  } : undefined,
}; 