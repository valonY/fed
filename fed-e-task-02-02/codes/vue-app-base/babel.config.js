module.exports = {
  presets: [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        loose: true,
        useBuiltIns: 'entry', // or "usage"
        corejs: 3
      }
    ]
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ],
  env: {
    development: {
      plugins: ['dynamic-import-node']
    }
  }
}
