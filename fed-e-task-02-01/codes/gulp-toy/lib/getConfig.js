const { resolve } = require('path')
const workspacePath = process.cwd()
const utils = require('../utils')

// 获取配置信息
const getConfig = () => {
  if (getConfig.config) return getConfig.config
  const isProduction = process.env.NODE_ENV === 'production'
  const _defaultConfig = {
    env: 'development',
    base: './src',
    temp: './temp',
    dist: './dist',
    compileReadPath: {
      STYLE: '**/*.scss',
      SCRIPT: ['**/*.js', '**/*.es6'],
      PAGE: ['./*.html', './*.swig'],
      EXTRA: 'public/**',
      IMAGE: 'assets/images/**',
      FONTS: 'assets/fonts/**',
    },
    browser: {
      notify: false,
      open: false,
      server: {
        baseDir: [
          resolve(
            process.cwd(),
            process.env.NODE_ENV === 'production' ? './dist' : './temp'
          ),
          'public',
        ],
      },
    },
  }

  let config = _defaultConfig

  try {
    const cfgFilePath = resolve(workspacePath, 'gulp.toy.js')
    const _config = require(cfgFilePath)
    config = Object.assign({}, _defaultConfig, _config)
  } catch (err) {}

  config = {
    ...config,
    env: process.env.NODE_ENV || config.env,
    base: utils.getAbsolutePath(config.base),
    temp: utils.getAbsolutePath(config.temp),
    dist: utils.getAbsolutePath(config.dist),
    templateData: {
      ...config.templateData,
      process: {
        env: {},
      },
    },
  }
  config.templateData.process.env.NODE_ENV = config.env

  if (!isProduction) {
    config.browser.server.baseDir.push(config.base)
    config.browser.server.routes = {
      '/node_modules': 'node_modules',
      ...config.browser.server.routes,
    }
  }
  getConfig.config = config

  return config
}

module.exports = getConfig