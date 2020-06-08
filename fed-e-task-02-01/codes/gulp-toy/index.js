const { dest, src, series, parallel, watch } = require('gulp')

const del = require('del')
const loadPlugins = require('gulp-load-plugins')
const { resolve, isAbsolute } = require('path')
const browserSync = require('browser-sync')

const workspacePath = process.cwd()
const plugins = loadPlugins()
const bs = browserSync.create()

const compileReadPath = {
  STYLE: '**/*.scss',
  SCRIPT: ['**/*.js', '**/*.es6'],
  PAGE: ['./*.html', './*.ejs'],
  EXTRA: 'public/**',
  CFG: './gulp.toy.js',
  IMAGE: 'assets/images/**',
  FONTS: 'assets/fonts/**',
}

const utils = {
  getAbsolutePath(path) {
    return isAbsolute(path) ? path : resolve(process.cwd(), path)
  },
  join(base, paths = []) {
    if (typeof paths === 'string') paths = [paths]
    return paths.map((path) => {
      if (utils.join[path]) return utils.join[path]
      const abPath = resolve(base, path)
      utils.join[path] = abPath
      return abPath
    })
  },
}

// 获取配置信息
const getConfig = () => {
  if (getConfig.config) return getConfig.config
  const isProduction = process.env.NODE_ENV === 'production'
  const _defaultConfig = {
    env: 'development',
    base: './src',
    temp: './temp',
    dist: './dist',
    templateData: {
      date: new Date(),
      description: 'This is a gulp toy',
      homepage: '0.0.0.0',
      menus: [
        {
          name: 'home',
          icon: 'aperture',
          link: 'index.html',
        },
        {
          name: 'Features',
          link: 'features.html',
        },
        {
          name: 'About',
          link: 'about.html',
        },
        {
          name: 'Contact',
          link: '#',
          children: [
            {
              name: 'Twitter',
              link: 'https://twiter.com/w_zce',
            },
            {
              name: 'About',
              link: 'https://weibo.com/zceme',
            },
            {
              name: 'divider',
            },
          ],
        },
      ],
      pkg: {
        name: 'gulp-toy',
        author: {
          url: '23333',
        },
      },
    },
    browser: {
      notify: false,
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
    const cfgFilePath = resolve(workspacePath, compileReadPath.CFG)
    const config = require(cfgFilePath)
    config = Object.assign({}, _defaultConfig, config)
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

const staticTask = () => {
  const { base, dist } = getConfig()

  const image = () =>
    src(utils.join(base, compileReadPath.IMAGE), { base })
      .pipe(plugins.imagemin())
      .pipe(dest(dist))

  const fonts = () =>
    src(utils.join(base, compileReadPath.FONTS), { base })
      .pipe(plugins.imagemin())
      .pipe(dest(dist))

  const extra = () =>
    src(utils.join(base, compileReadPath.EXTRA), {
      base: compileReadPath.EXTRA,
    }).pipe(dest(dist))

  return {
    image,
    fonts,
    extra,
  }
}

module.exports = (() => {
  const { base, temp, dist, templateData = {} } = getConfig()

  const clean = () => del([temp, dist])

  const style = () =>
    src(utils.join(base, compileReadPath.STYLE), { base })
      .pipe(plugins.sass({ outputStyle: 'expanded' }))
      .pipe(dest(temp))
      .pipe(bs.reload({ stream: true }))

  const script = () =>
    src(utils.join(base, compileReadPath.SCRIPT), { base })
      .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
      .pipe(dest(temp))
      .pipe(bs.reload({ stream: true }))

  const page = () =>
    src(utils.join(base, compileReadPath.PAGE), { base })
      .pipe(
        plugins.swig({
          data: templateData,
          defaults: {
            cache: false,
          },
        })
      )
      .pipe(dest(temp))
      .pipe(bs.reload({ stream: true }))

  const tasks = {
    style,
    script,
    page,
  }

  const server = () => {
    const { browser } = getConfig()
    const mediaPaths = []
    Object.entries(compileReadPath).forEach(([key, path]) => {
      if (typeof path === 'string') path = [path]
      path.forEach((v) => {
        const curTask = tasks[key.toLowerCase()]
        curTask
          ? watch(utils.join[v], curTask)
          : utils.join[v] && mediaPaths.push(utils.join[v])
      })
    })
    watch(mediaPaths, bs.reload)
    return bs.init(browser)
  }

  const useref = () =>
    src(`${temp}/*.html`, { base: temp })
      .pipe(plugins.useref({ searchPath: ['./temp', '.'] }))
      .pipe(plugins.if(/\.js$/, plugins.uglify()))
      .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
      .pipe(
        plugins.if(
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
          })
        )
      )
      .pipe(dest(dist))

  return {
    get build() {
      process.env.NODE_ENV = process.env.NODE_ENV || 'production'
      const { fonts, image, extra } = staticTask()
      const compile = parallel(style, script, page, fonts, image)
      return series(clean, parallel(compile, useref), extra, server)
    },
    get develop() {
      process.env.NODE_ENV = process.env.NODE_ENV || 'development'
      const compile = parallel(style, script, page)
      return series(clean, compile, server)
    },
  }
})()
