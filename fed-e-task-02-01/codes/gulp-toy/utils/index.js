const { isAbsolute, resolve } = require('path')

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

module.exports = utils