const { dest, src, series, parallel, watch } = require('gulp')

const del = require('del')
const loadPlugins = require('gulp-load-plugins')
const browserSync = require('browser-sync')
const utils = require('./utils')
const getConfig = require('./lib/getConfig')
const staticTask = require('./lib/staticTasks')

const plugins = loadPlugins()
const bs = browserSync.create()


module.exports = (() => {
  const { base, temp, dist, templateData = {}, compileReadPath } = getConfig()

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
      return series(clean, parallel(compile, extra), useref)
    },
    get develop() {
      process.env.NODE_ENV = process.env.NODE_ENV || 'development'
      const compile = parallel(style, script, page)
      return series(clean, compile, server)
    },
  }
})()
