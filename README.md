# IBD企业后台管理web

可以直接在项目里使用 ES6/7（Generator Function, Class, Async & Await）等特性，借助 Babel 编译，可稳定运行在 Node.js 环境上。

[开发模式] 开发模式下，文件修改后自动热重启服务。       

[调试模式] 断点调试 (test feature)

[线上模式] 借助 pm2 使用 cluster 模式压榨多核 CPU 性能

## Getting Start

```
git clone git@192.168.92.3:ibd/ibd-tenant-web.git
cd ibd-tenant-web
npm install
npm start
```

然后使用浏览器打开 http://127.0.0.1/ 即可

## Npm scripts

```bash
$ npm start # 开发模式, 开启开发模式之后对于 /src 目录内的任何改动会自动热替换生效
$ npm build # 编译
$ npm run compile # 编译
$ npm run production # 生产模式
```



## 线上部署

```bash
npm run build # 单测, 编译 ES6/7 代码至 ES5
vim pm2.json # 检查 pm2 的配置
pm2 start pm2.json # pm2模式启动
```



## 配置文件的 trick

引用配置的方式:

```javascript
import config from './config'
```

默认配置文件位于 `src/config/default.js`, 建议只在这里创建配置字段, 在同目录下创建另一个 `custom.js`, 这个配置会覆盖(override) 默认配置, 且此文件不会被包含在 git 中, 避免密码泄露, 线上配置等问题.



## 断点调试

[测试功能]

```bash
$ npm run debug
```


## 目录结构说明

```bash
.
├── README.md
├── app                     # babel outDir
│   ├── *
├── bin
│   ├── debug.js
│   ├── development.js      # 开发模式下项目的入口文件
│   └── production.js       # 线上入口文件, 请预先使用 npm run compile 编译
├── nginx.conf              # nginx 的配置文件，建议线上使用 nginx 做反向代理。
├── package.json            # package.json
├── pm2.json                # 用于 pm2 部署
├── public                  #  存放在线开发接口API文档，可以在线测试，正式生产环境会去掉。
│   ├── favicon.ico
│   ├── robots.txt
│   └── static
├── src                     # 源代码目录，编译时会自动将 src 目录下的文件编译到 app 目录下。src 下的目录结构可以自行组织, 但是必须是 babel 可接受的类型(js, json, etc...)。
│   ├── app.js              # koa 配置
│   ├── config              # 配置目录
│   ├── controllers         # 控制器
│   ├── index.js            # 入口文件
│   ├── models              # 模型
│   ├── routes              # 路由
│   └── services            # service
├── test                    # 测试目录现在在项目根目录下
│   └── test.js

```


