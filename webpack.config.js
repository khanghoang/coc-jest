const path = require('path')

module.exports = {
  entry: './src/Core/index.ts',
  target: 'node',
  mode: 'none',
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.js', '.ts']
  },
  externals: {
    'coc.nvim': 'commonjs coc.nvim'
  },
  devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            "sourceMap": true,
          }
        }
      }]
    }]
  },
  output: {
    path: path.join(__dirname, 'lib/Core/'),
    filename: 'index.js',
    libraryTarget: "commonjs",
  },
  plugins: [
  ],
  node: {
    __dirname: false,
    __filename: false
  }
}


