const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyPlugin = require('copy-webpack-plugin')
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const { resolve } = require('path')
const pwd = process.cwd()

const outputRoot = resolve(pwd, './dist/')
const entry = resolve(pwd, './src/main.js')

const common = {
  mode: process.env.NODE_ENV || 'development',
  entry,
  output: {
    publicPath: '/',
    path: outputRoot,
    filename: 'js/[name]-[hash:8].js',
    chunkFilename: 'js/[name]-[contenthash:8].js'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/')
    },
    extensions: [
      '.vue',
      '.js',
      '.jsx',
      '.json',
      '.scss',
      '.sass',
      '.less',
      '.css'
    ]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: ['thread-loader', 'vue-loader']
      },
      {
        test: /.js|jsx$/,
        include: [resolve(pwd, 'src')],
        use: [
          {
            loader: 'thread-loader',
            options: {
              name: '[name].[contenthash:8].js'
            }
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /.(le|c)ss$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.((webm|png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf))$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8 * 1024,
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        use: ['thread-loader', 'cache-loader', 'url-loader']
      }
    ]
  },
  optimization: {
    concatenateModules: true, // Scope Hoisting
    usedExports: true, // 只引入被import的包
    minimize: true,
    chunkIds: 'named',
    moduleIds: 'hashed',
    sideEffects: true,
    runtimeChunk: {
      name: 'runtime'
    },
    splitChunks: {
      chunks: 'async',
      automaticNameDelimiter: '~',
      cacheGroups: {
        element: {
          name: 'element',
          test: (module) => {
            const { resource } = module
            const flag =
              resource && /[/]node_modules[/]element-ui[/]/.test(resource)
            return flag
          },
          chunks: 'initial',
          reuseExistingChunk: true,
          enforce: true,
          priority: 8
        },
        vueBase: {
          name: 'vue-base',
          test: ({ resource }) => {
            return resource && /[/]node_modules[/]vue(.+?)[/]/.test(resource)
          },
          chunks: 'initial',
          reuseExistingChunk: true,
          priority: 5
        },
        common: {
          name: 'common',
          reuseExistingChunk: true,
          chunks: 'all',
          minChunks: 2,
          priority: 2,
          enforce: true
        },
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          reuseExistingChunk: true,
          priority: -10,
          enforce: true // 此处打包包含了整个node_modules与一些其他打包策略重合了，直接强制打包,其他交给权重控制
        }
      }
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: 'public',
          context: pwd
        }
      ]
    })
    // new HardSourceWebpackPlugin(),
  ]
}
module.exports = common
