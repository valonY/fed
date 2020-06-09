process.argv.push('--base')
process.argv.push(process.cwd())
process.argv.push('--gruntfile')
process.argv.push(require.resolve('..'))

try {
  require('grunt-cli/bin/grunt')
} catch(err) {
  console.log(err)
}