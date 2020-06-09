const { dest, src } = require('gulp')
const getConfig = require('./getConfig')

const staticTask = () => {
  const { base, dist, compileReadPath } = getConfig()

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

module.exports = staticTask
