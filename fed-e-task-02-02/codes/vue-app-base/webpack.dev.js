const Packer = require('./makePackCfg')

const packer = new Packer()

packer.setDevServer((config) => {
  config.proxy = {
    [process.env.BASE_API_ROOT]: {
      target: process.env.HOST,
      changeOrigin: true,
      secure: false,
      pathRewrite: {}
    }
  }
  return config
})

module.exports = packer.getConfig()
