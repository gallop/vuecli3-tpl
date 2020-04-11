'use strict'
// JavaScript 严格模式（strict mode）即在严格的条件下运行。
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Element Admin' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 9527// dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,

  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack: config => {
    // 移除 prefetch 插件
    config.plugins.delete('preload')
    // 移除 preload 插件
    config.plugins.delete('prefetch')

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
    // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
              // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  },
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    // 配置跨域,可以用来使用mock,如果不想使用可以屏蔽下面部分
    proxy: {
      '/api': { // 代理api
        target: 'http://localhost:9527', // --------代理服务器api地址
        ws: true, // proxy启用websockets
        changOrigin: true, // 是否跨域
        // 重写路径
        pathRewrite: {
          '^/api': '/mock'
        }
        // 然后你就可以在代码中使用 /api 来代替http://localhost:9527/mock啦
      }
    }
  },
  css: {
    // 项目package.json查看@vue/cli-service版本号进行配置
    // v3用modules v4用requireModuleExtension
    // modules: false,
    // https://github.com/vuejs/vue-cli/blob/dev/docs/zh/guide/css.md#css-modules
    // 如果你想去掉文件名中的 .module，可以设置 vue.config.js 中的 css.requireModuleExtension 为 false
    requireModuleExtension: false,
    // 将组件内的 CSS 提取到一个单独的 CSS 文件 (只用在生产环境中)
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true, // Default: 生产环境下是 true，开发环境下是 false
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      // 配置全局样式变量
      // https://cli.vuejs.org/zh/guide/css.html
      sass: {
        // 引入全局变量样式
        // 注意：在 sass-loader v7 中，这个选项名是 "data"
        data: `
              @import "@/assets/style/variables.scss";
              `
      }

    }
  }
}
