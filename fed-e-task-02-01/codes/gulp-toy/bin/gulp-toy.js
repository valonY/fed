#!/usr/bin/env node

process.argv.push('--cwd')
process.argv.push(process.cwd())
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..'))

try {
  require('gulp/bin/gulp')
} catch (err) {
  console.log(err)
}