const Packer = require('./makePackCfg')

const packer = new Packer()

packer.setDevServer((config) => {
  config.open = false
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

packer.serve()
