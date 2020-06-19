const { resolve } = require('path')
const sass = require('node-sass')
const merge = require('lodash.merge')

const getCwdPath = path => {
  const cwd = process.cwd()
  return resolve(cwd, path)
}

const defaultConfig = {
  dist: getCwdPath(`./dist/`),
  base: getCwdPath('./src'),
  test: {
    js: {
      use: ['**/*.js', '**/*.es6'],
      options: {
        sourceMap: false,
      },
    },
    css: {
      use: ['**/*.scss', '**/*.sass'],
      options: {
        sourceMap: false,
        implementation: sass,
      },
    },
    html: {
      use: ['./*.html', './*.swig'],
      options: {
        cache: false
      }
    }
  },
}

let config = defaultConfig

try {
  const custom = require(getCwdPath('./grunt.toy.js'))
  config = merge({}, defaultConfig, custom)
} catch (err) {}

module.exports = grunt => {
  require('load-grunt-tasks')(grunt, {
    config: resolve(__dirname, './package.json'),
    requireResolution: true,
  })

  const simpleFileCfg = (name) => ({
    expand: true,
    cwd: config.base,
    ext: `.${name}`,
    src: config.test[name].use,
    dest: config.dist,
  })

  grunt.initConfig({
    clean: {
      temp: getCwdPath('./temp/**'),
      dist: getCwdPath('./dist/**')
    },
    babel: {
      options: {
        presets: ['@babel/preset-env'],
        ...config.test.js.options,
      },
      temp: {
        files: [simpleFileCfg('js')],
      },
    },
    sass: {
      options: config.test.css.options,
      temp: {
        files: [simpleFileCfg('css')],
      },
    },
    swig: {
      options: config.test.html.options,
      temp: {
        files: [simpleFileCfg('html')],
      },
    },
    watch: {
      options: {
        livereload: true,
      },
      html: {
        files: ['**/*.html', '**/*.swig'],
        tasks: ['swig'],
        options: {
          spawn: false,
        },
      },
      js: {
        files: config.test['js'].use,
        tasks: ['babel'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: config.test['css'].use,
        tasks: ['sass'],
        options: {
          spawn: false,
        },
      },
    },
    browserSync: {
      bsFiles: {},
      options: {
        notify: false,
        open: false,
        server: {
          baseDir: [
            resolve(
              process.cwd(),
              process.env.NODE_ENV === 'production' ? './dist' : './temp'
            ),
            'src',
            'public',
          ],
          routes: {
            '/node_modules': 'node_modules',
          },
        },
        options: {
          watchTask: true,
        },
      },
    },
    useref: {
      html: `${config.dist}/*.html`,
      temp: ['./temp', '.'],
    },
  })
  // TODO: 此处browserSync启动后无法执行watch
  grunt.registerTask('serve', ['browserSync', 'watch'])
  // TODO: 仨编译任务无法并行
  grunt.registerTask('develop', function () {
    grunt.task.run(['clean', 'babel', 'sass', 'swig', 'serve'])
  })
  // TODO: build for live 相关功能未实现
  grunt.registerTask('build', function () {
    grunt.task.run(['clean', 'babel', 'sass', 'swig', 'useref'])
  })
}