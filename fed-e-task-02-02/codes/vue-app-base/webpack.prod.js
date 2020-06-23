const Packer = require('./makePackCfg')

const packer = new Packer()

packer.setExternals({
  vue: 'Vue',
  'vue-router': 'VueRouter',
  vuex: 'Vuex',
  'element-ui': 'ELEMENT',
  axios: 'axios'
}, cacheGroup => {
  Reflect.deleteProperty(cacheGroup, 'element')
  return cacheGroup
})([
  '//unpkg.com/vue@2.6.11/dist/vue.min.js',
  '//unpkg.com/vue-router@3.3.4/dist/vue-router.min.js',
  '//unpkg.com/vuex@3.4.0/dist/vuex.min.js',
  '//unpkg.com/element-ui@2.13.2/lib/index.js',
  '//cdn.bootcss.com/axios/0.19.2/axios.min.js'
])

packer.build()
