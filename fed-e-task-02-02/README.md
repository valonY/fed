## Fed-e-task-01-02

### Webpack 的构建流程主要环节？描述 Webpack 打包的整个过程。

* 主要流程
  ```html
    初始化 : 启动构建， 读取与合并参数，加载plugins，实例化complier
      ⬇️
    编  译 : 从entry出发，针对每一个module调用对应的loader， 翻译文件内容并找到module的依赖进行编译
      ⬇️
    输 出 :  将编译后的module组合成chunk将chunk转换成文件输出到文件系统
  ```
* 流程说明
  1. webpack生成的complier，将在插件被应用时在插件内部被接收，以此插件可以访问整个webpack环境，挂载到webpack的Tapable钩子上。webpack会运行到插件内部挂载的生命周期时执行插件逻辑。
  2. webpack每当检测到一个文件变化的时候就会产生一个新的compilation对象，其表述了当前资源模块，编译生成资源，变化的文件以及跟踪的依赖的状态信息，该对象也提供了很多关键步骤的回调，以供插件自定义处理使用
  3. chunks代表chunk类，用于构建需要的chunk将由compilation创建后保存管理,webpack中最核心的compile和负责创建bundle的compilation都是Tapable的实例
  4. Module是用于表示代码模块的基础类，衍生不同的子类来处理不同的情况，关于代码模块的信息都会保存在Module的实例中，当一个module被创建比较重要的一步就是执行compilation.bindModule方法，其会调用Module实例的bind方法来创建实例所需要的一些配置与依赖(PS: 偶尔我们在配置webpack做多进程的时候，如果控制台发现`Module: bind is not define`类似这样的error，很可能就是多进程间文件的编译出现了问题，个人没啥好办法，就是把当前Module编译的多进程模式给拔了), 然后调用Module实例的runLoader方法(loader-runner)，执行对应的loader,将代码source流入指定loaders(从右到左)最后一个loader处理后，继续流向下一个loader(从右到左)，最终再把结果保存起来。
  5. Parser, 利用基于acorm库来分析ast语法树，解析出代码的依赖。
  6. 最终所有但资源都将经由于webpack的Template模块进行整理编译后输出.

### Loader & Plugin 的不同，Loader/Plugin如何开发

1. loader用于对开发者源代码的转换，功能而言，跟webpack本身并没有强耦合的关系。
2. webpack plugin是作为webpack的一个插件机制存在，将webpack提供的处理方法暴露给第三方（开发者）来开发。在整个项目架构中，往往起宏观上的作用。其访问到的webpack环境资源往往都是经过loader处理过的。

#### 自定义loader
  > 自定义loader非常简单，往往你只需要暴露一个函数，webpack就会回传给你对应的文件资源供你处理

  ```js
    module.exports = source => {
      /* maybe u can parse source to ast by any tools and translate it to * what u want~
      * in the end u should return the result to webpack after
      */
      return source
    }
  ```

#### 自动移plugin
  > 自定义plugin 思路上来说比较复杂，你需要明确你希望执行的task是否为异步，并期望webpack在哪一个生命周期调用你的插件逻辑。但实现上，往往你只需要定义一个类并提供好apply方法就好了

  ```js
    class MyPlugin {
      constructor (options) {
        this.opts = options
      }
      // 回传complier对象，以供开发者访问webpack内部环境
      apply (complier) {
        // 调用合适的complier.hooks钩子注入task，根据你选择的钩子的类型，选择好触发钩子的方式(tab/tabAsync/tapPromise)并回传compilation以供开发者处理当前的资源信息
        complier.hooks.done.tap(
          'Here always is your custom plugin name',
          (compilation, cb) => {
            // TODO: u can also do something here in compilation...
            // if u want to custom a plugin insert other plugin's logical after, u may⬇️

            compilation.plugin(
              '<which plugin u want to supplement>',
              (pluginData, callback) => {
                // pluginData is the source from another plugin handled after
                // In the end, anyway no matter `compilation` or `pluginData` they would passed by address, u can just modify it without return
              }
            )
          }
        )
      }
    }
  ```

### 编程项目介绍
* 自定义了一个Packer工具， 并且内部封装了webpack， package.json的脚本调用上无论是`serve`或`build`都将通过node调用，而不是通过webpack
  ```json
    {
      "serve": "cross-env NODE_ENV=development node webpack.dev.js",
      "build": "cross-env NODE_ENV=production node webpack.prod.js",
    }
  ```
* Packer是一个针对vue高度定制化的工具，也提供了一些Api允许开发者去覆盖/更改配置，初心是尽量往黑盒做，让开发者毫无体感。

* 内部开启了多进程编译与缓存编译，缓存编译使用的是‘cache-loader’,
  多进程采用的是‘thread-loader’ + TerserPlugin,尽管做了很多的优化，但可能你会发现其编译速度依然没那么快，我个人但感觉是这种速度其实应该是相对的，目前项目较小但加载但插件/loader较多，因而看不出速度的提升，但当项目大起来之后，应该才会有体感上的感知。

* 项目目录下有几个env文件，参照vue-cli官网，只需要在env中写入对应的变量(key=value)，则process.env中就会存储宁定义的这个变量了,env文件的权重也是完全follow vue-cli官网对env的介绍。

* production模式打包应该会比dev模式下慢一点(nearly 3s gap)，原因是拔除了样式编译的多进程模式，并且添加了图片资源的压缩

* 第一次编译项目可能较慢，后面将稍微变快大概在10-20%左右,项目体量上去后增量可能会改变。

* npm下载可能较慢，原因是几个做图片压缩的包很难下

* 关于Packer更多详细信息请参看项目vue-app-base下的`README.md`文件说明。
