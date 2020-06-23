# vue-app-base

## Background
1. 这是一个使用 Vue CLI 创建出来的 Vue 项目基础结构
2. 有所不同的是这里我移除掉了 vue-cli-service（包含 webpack 等工具的黑盒工具）
3. 这里的要求就是直接使用 webpack 以及你所了解的周边工具、Loader、Plugin 还原这个项目的打包任务
4. 尽可能的使用上所有你了解到的功能和特性

## Description
1. 补充点: 使用eslint + prettier + editorconfig对开发者对编码进行规范
2. 补充点: 尝试封装了一个tools(makePackCfg)类似chainWebpack但没有那么复杂,来让配置更加定制化(针对vue,可以针对packer规则重写),如果为了以后方便可以将其抽出到单独脚手架中，但其作用更像是一个工具而已，以下是内置的规则主要简介:
    * packer支持链式调用(非函数式)

    * 项目配置内部启用多进程打包，提高编译速度,开发者可以根据自己的需要，调用setRuleItem Api加入'cache-loader',再加快打包速度(可能有坑)。

    * 提供重写rules，重写plugins的API，具体使用参见makePackCfg.js 中的defaultProdSet方法, 注意: 如果调用setRuleItem/setPlugin重写或新增rule/plugin后(可以多次)，但最后需要调用对应的transPlugins/transRule方法来使packer配置转换为webpack需要的配置.

    * 内置常规分包策略，开发者可以调用setOptimization方法重写分包策略。

    * 开发者可以在开发环境下调用setExternals来设置CDN链接🔗，具体使用方法如webpack.prod.js中使用方式.

    * 最终调用packer.getConfig将导出一个适用于webpack的配置

    * 本项目配置经packer集成, 更多使用，请参见makePackCfg注释说明。

    * 当production模式样式打包将不走单独进程，默认使用MiniCssPlugin时，请不要开启多进程模式，将报错。 development模式下样式打包是走单独进程的。

    * 文件file(url-loader, file-loader)没有开启多进程打包，development环境会开启'cache-loader'
      development 环境开启了webpack-bundle-analyzer，可以通过8888端口查看运行打包情况
      devServer 启动在源IP 0.0.0.0, 需要手动输入本地环路地址或或路地址别名(localhost)进行访问

    * 关于项目启动变量，文件根目录下有.env  .env.local .env.[NODE_ENV] .env.[NODE_ENV].local文件，里面但变量将注入到process.env内, 参
      ```
      .env                # 在所有的环境中被载入
      .env.local          # 在所有的环境中被载入，但会被 git 忽略
      .env.[NODE_ENV]         # 只在指定的模式中被载入
      .env.[NODE_ENV].local   # 只在指定的模式中被载入，但会被 git 忽略
      ```
      一个环境文件只包含环境变量的“键=值”对：
      ```
      FOO=bar
      BASE_URL=/
      BASE_API_ROOT=/api
      ```
      配置好环境变量之后，对应的可以查看webpack.dev.js文件中devServer的配置就能更灵活了
    
    * 因为项目已经配置了语法检测包括在保存代码时，pre-commit时都有语法检测，因此对js的解析并没有使用eslint-loader，毕竟加上eslint-loader也会减慢项目的编译速度, 并且项目没有使用prettier来强制覆盖代码，我觉得这应该是不合理的，开发者的代码应该受规范约束，而不是规范帮我们写代码。

    * 同时应该确保vscode安装了eslint与stylelint插件

## Supplement(To be optimize)
* 如果不习惯可以使用webpack-chain生成配置: https://github.com/neutrinojs/webpack-chain#getting-started
* 项目没有使用dll, 考虑到需要再写一份配置并且要做抽离较为麻烦
* 项目没有使用HardSourceWebpackPlugin，不稳定
