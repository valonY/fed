## Fed-e-task-01-02

### 工程化的认识，解决的问题，带来的价值
  * 认识
    ### **前端工程化最基本的要素**
      > 模块化是前端工程化实现分治的重要手段，微前端是前端工程分治的手段。
      * 模块化(AMD/UMD/CommonJs/ESM)
      * 组件化
        > 页面上所有的东西都可以看成组件，页面是个大型组件(Vue/React应用中的根节点)，可以拆成若干个中型组件(具有抽象+业务能力的各子节点)，然后中型组件还可以再拆，拆成若干个小型组件(抽象且与业务松耦的节点)...
      * 规范化
        * 目录结构约定
        * 编码规范(eslint, tslint)
        * 前后端接口规范(集成的工具有: sagger, YApi...)
        * 文档规范(例如对应目录下的README，都是必要的)
        * 组件管理
        * Git分治管理(git flow / github flow)
        * commit信息描述规范
        * 定期的codeReview
        * UI 视觉图标规范
      * 自动化
        * 流程自动化，人员协同自动化
        * 代码开发自动化，去除重复的劳作(一些脚手架的文件生成)
        * 自动单元测试(Mocha + chai / Jasmine...)
        * 自动化部署(CI/CD)
        * 自动化问题反馈
  * 解决的问题
    * 传统语言语法的弊端
    * 大量手动重复机械操作
    * 开发团队风格不统一
    * 前端依赖后端服务接口支持
  * 带来的价值
    __提高开发效率和降低开发/维护成本。<br>
    用流程规范每一个开发活动，使敏捷开发成为可能。__

### 脚手架的意义
  * 统一团队代码风格
  * 集成便捷代码块，快速生成所需代码(常规如ts接口生成)
  * 集成工作流，提高团队开发效率和统一团队开发规范
  * 集成迎合公司业务的重复性工作，提高开发人员专注度

### 编程概述
  > 代码放置在根下codes目录中，`grunt-toy`和`gulp-toy`分别为grunt/gulp对`pages-boilerplate`项目对打包，使用前需要在对应对目录下先进行软链，再去`pages-boilerplate`中链接对应对包(`grunt-toy`/`gulp-toy`),`pages-boilerplate`目录下具有一个`gulp.toy.js`和`grunt.toy.js`分别为对`pages-boilerplate`进行配置对文件，其中`grunt.toy.js`只完成了`development`下的打包策略，`gulp.toy.js`中也抽的不好，都是大概表达个意思，包括：
  * 编译路径配置信息
  * 输出输入配置信息
  * server服务器配置
  * 模板数据注入(一般用作生产环境cdn镜像链接注入)
  * 环境变量注入