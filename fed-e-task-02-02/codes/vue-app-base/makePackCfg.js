const { resolve } = require('path')
const pwd = process.cwd()
const merge = require('webpack-merge')

const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlTagPlugin = require('html-webpack-tags-plugin')
const dotenv = require('dotenv')

function getEnvProperties () {
  const curEnvName = process.env.NODE_ENV
  // 在所有的环境中被载入
  const envPath = resolve(pwd, '.env')
  // 在所有的环境中被载入，但会被 git 忽略
  const envLocalPath = resolve(pwd, '.env.local')
  // 只在指定的模式中被载入
  const envModePath = resolve(pwd, `.env.${curEnvName}`)
  // 只在指定的模式中被载入，但会被 git 忽略
  const envModeLocalPath = resolve(pwd, `.env.${curEnvName}.local`)

  const dc = dotenv.config

  let env = dc({
    path: envPath
  })
  let envLocal = dc({
    path: envLocalPath
  })
  let envMode = dc({
    path: envModePath
  })
  let envModeLocal = dc({
    path: envModeLocalPath
  })

  env = env.parsed || {}
  envLocal = envLocal.parsed || {}
  envMode = envMode.parsed || {}
  envModeLocal = envModeLocal.parsed || {}
  return Object.assign(env, envLocal, envMode, envModeLocal)
}

const outputRoot = resolve(pwd, './dist/')
const entry = resolve(pwd, './src/main.js')
const { name } = require(resolve(pwd, './package.json'))

const isProd = process.env.NODE_ENV === 'production'

// 默认rules规则 development
const rules = {
  vue: {
    test: /\.vue$/,
    use: ['thread-loader', 'vue-loader']
  },
  js: {
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
  css: {
    test: /.(le|c)ss$/,
    use: ['thread-loader', 'style-loader', 'css-loader', 'less-loader']
  },
  file: {
    test: /\.((webm|png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf))$/,
    use: [
      'cache-loader',
      {
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          esModule: false
        }
      }
    ]
  }
}

// 默认插件规则 development
const plugins = {
  vue: new VueLoaderPlugin(),
  clean: new CleanWebpackPlugin({
    root: resolve(pwd, './dist/**/*')
  }),
  copy: new CopyPlugin({
    patterns: [
      {
        from: 'public',
        to: 'public',
        context: pwd
      }
    ]
  }),
  analyze: new BundleAnalyzerPlugin({
    openAnalyzer: false
  }),
  html: new HtmlPlugin({
    title: name,
    template: resolve(pwd, './index.html'),
    filename: 'index.html',
    templateParameters: {
      BASE_URL: process.env.BASE_URL || '/'
    }
  }),
  hotModule: new webpack.HotModuleReplacementPlugin(),
  define: new webpack.DefinePlugin({
    'process.env': JSON.stringify({
      ...process.env,
      ...getEnvProperties(),
      NODE_ENV: process.env.NODE_ENV
    })
  })
}

// 默认配置 development
const config = {
  mode: process.env.NODE_ENV || 'development',
  entry,
  devtool: 'cheap-module-source-map',
  module: {
    rules: []
  },
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
  optimization: {
    concatenateModules: true, // Scope Hoisting
    usedExports: true, // 只引入被import的包
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
          priority: 1,
          enforce: true // 此处打包包含了整个node_modules与一些其他打包策略重合了，直接强制打包,其他交给权重控制
        }
      }
    }
  },
  plugins: [],
  devServer: {
    contentBase: outputRoot,
    open: true,
    compress: true,
    host: '0.0.0.0',
    port: '8080',
    hotOnly: true,
    inline: true,
    watchContentBase: true,
    historyApiFallback: true
  }
}

class Packer {
  constructor (cfg = {}) {
    this.cfg = merge(config, cfg)
    this.cfg.mode = process.env.NODE_ENV
    this.cfg.module.rules = []
    if (isProd) this.defaultProdSet()
    this.transRule().transPlugins()
  }

  // 默认设置生产模式的配置
  defaultProdSet () {
    return (
      this.setOptimization((optimization) => {
        optimization.minimize = true
        return optimization
      })
        .removeDevServer() // 移除devServer
        .removePlugin('hotModule') // 移除hotModule插件
        .removePlugin('analyze') // 移除尺寸分析插件
        .setRuleItem('css')(() => ({
          // 重置样式打包的规则
          test: /.(le|c)ss$/,
          use: [
            {
              loader: MiniCssPlugin.loader,
              options: {
                publicPath: resolve(outputRoot, './dist/css')
              }
            },
            'css-loader',
            'less-loader'
          ]
        }))
        // 重置file打包的规则
        .setRuleItem('file')(() => ({
          test: /\.(webm|png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5 * 1024, // win系统下新建文件默认已具有4kb(头部声明)
                esModule: false,
                name: '[name].[contenthash:8].[ext]',
                outputPath: 'assets',
                publicPath: '/assets',
                fallback: 'file-loader'
              }
            }
          ]
        }))
        // 关闭devtool
        .setDevTool('none')
        // 开启样式单独打包插件,并支持多chunk
        .setPlugin('css')(
          () =>
            new MiniCssPlugin({
              filename: 'css/[name].css',
              chunkFilename: 'css/[name].[contenthash:8].css',
              allChunks: true,
              ignoreOrder: true
            })
        )
        // 开启样式压缩插件
        .setPlugin('optimize')(() => new OptimizeCSSAssetsPlugin({}))
        // 设置html文件打包
        .setPlugin('html')(() => {
          const optimization =
          (this.cfg.optimization &&
            this.cfg.optimization.splitChunks &&
            this.cfg.optimization.splitChunks.cacheGroups) ||
          {}
          const chunks = []
          for (const k in optimization) {
            if (!optimization[k].name) { throw new Error('Chunk should have a name to support html plugin!') }
            chunks.push(optimization[k].name)
          }
          chunks.push('main')
          return new HtmlPlugin({
            title: name,
            template: resolve(pwd, './index.html'),
            filename: 'index.html',
            templateParameters: {
              BASE_URL: process.env.BASE_URL || ''
            },
            minify: { collapseWhitespace: true },
            chunks: chunks,
            chunksSortMode: 'manual'
          })
        })
    )
  }

  // 设置devtool模式
  setDevTool (type = 'none') {
    this.cfg.devtool = type
    return this
  }

  // 转换packer rules/plugins 为webpack rules/plugins
  transRule () {
    this.cfg.module.rules = []
    for (const k in rules) {
      rules[k] && this.cfg.module.rules.push(rules[k])
    }
    return this
  }

  // 设置/新增 packer rule, 同样最终操作都需要调用transRule来转换
  setRuleItem (key) {
    return (cb) => {
      const oldRule = rules[key] || {}
      const newRule = (cb && cb(oldRule)) || oldRule
      rules[key] = newRule
      return this
    }
  }

  // 删除某一packer rule, 同样最终操作都需要调用transRule来转换
  removeRule (key) {
    if (key in rules) Reflect.deleteProperty(rules, key)
    return this
  }

  // 设置/新增alias 形式如: packer.setAlias(key)(oldAlias => path.resolve(__dirname, 'src/xxx/xx'))
  setAlias (key) {
    return (cb) => {
      const oldAlias = this.cfg.resolve.alias[key]
      const alias = (cb && cb(oldAlias)) || ''
      this.cfg.resolve.alias[key] = alias || oldAlias
      return this
    }
  }

  // 添加webpack导入识别的拓展名 packer.addExtension('.txt')
  addExtension (ext) {
    ext &&
      !this.cfg.resolve.extensions.includes(ext) &&
      this.cfg.resolve.extensions.push(ext)
    return this
  }

  // 获取对应key的 rule 规则
  getRuleItem (key) {
    return rules[key]
  }

  // 添加/更新 对应key插件的配置 参考defaultProdSet中用法, 最终都需要进行transPlugins
  setPlugin (key) {
    const oldPlugin = plugins[key]
    return (cb) => {
      plugins[key] = (cb && cb(oldPlugin)) || oldPlugin
      return this.transPlugins()
    }
  }

  // 移除对应key的插件, 最终都需要进行transPlugins
  removePlugin (key) {
    if (key in plugins) Reflect.deleteProperty(plugins, key)
    return this
  }

  // 将packer plugins 转为 webpack plugins
  transPlugins () {
    this.cfg.plugins = []
    for (const k in plugins) {
      plugins[k] && this.cfg.plugins.push(plugins[k])
    }
    return this
  }

  // 设置压缩策略，包括分包策略
  setOptimization (cb) {
    const oldOptimization = Object.assign({}, this.cfg.optimization)
    const newOptimization =
      (cb && cb(oldOptimization, process.env.NODE_ENV)) || {}
    this.cfg.optimization = merge(oldOptimization, newOptimization)
    return this
  }

  // 移除devServer， 默认devServer是开启的
  removeDevServer () {
    Reflect.deleteProperty(this.cfg, 'devServer')
    return this
  }

  // 设置devServer, 添加proxy， packer.setDevServer(config => _config)
  setDevServer (cb) {
    const oldCfg = Object.assign({}, this.cfg.devServer || {})
    const newCfg = cb && cb(oldCfg)
    this.cfg.devServer = merge(oldCfg, newCfg)
    return this
  }

  // 设置externals，并需要给予对应的cdn链接否则将报错
  setExternals (externals, cb) {
    return (cdn = []) => {
      this.cfg.externals = merge(this.cfg.externals, externals)
      this.cdn = cdn
      if (Object.keys(this.cfg.externals).length && !this.cdn.length) { throw new Error('externals should match exactly cdn!') }
      return this.setPlugin('htmlTag')(
        () =>
          new HtmlTagPlugin({
            append: false,
            prependExternals: true,
            scripts: this.cdn
          })
      ).setOptimization((optimization) => {
        const cacheGroup =
          optimization.splitChunks && optimization.splitChunks.cacheGroups
        optimization.splitChunks.cacheGroups =
          optimization.splitChunks.cacheGroups &&
          cb &&
          cb.call(this, cacheGroup)
        return optimization
      })
    }
  }

  // 导出webpack配置
  getConfig () {
    return this.cfg
  }
}

module.exports = Packer
