import http from "http";
import Koa from "koa";
import path from "path";
import views from "koa-views";
import convert from "koa-convert";
import json from "koa-json";
import Bodyparser from "koa-bodyparser";
// import logger from "koa-logger";
import {logger} from './lib/log/logger'
import koaStatic from "koa-static-plus";
import koaOnError from "koa-onerror";
import config from "./config";
var session = require('koa-generic-session');
// var RedisStore = require('koa-redis');
// import {redis} from "./utils/cache/redis-cluster";-----------------
var filter = require("./routes/filter");
import {get, post,put,del} from "./utils/rest/restService";
var grpc = require('grpc');
import {serviceIntf, serviceImpl} from "./server/T1Server";
// import body from "koa-better-body"

const app = new Koa()
const bodyparser = Bodyparser()
app.enableCache = true;
app.keys = ["sj", "shengjing"];//设置 Signed Cookie 的密钥 Signed必须为true
// 设置 Session
app.use(session({
    // store: new RedisStore({client:redis}),//此段非常重要，解决redis集群存储共享session
    // resave: true, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret:"shengjing360",
    cookie:{
        maxAge:60*60*1000,
        overwrite: true,
        signed: true
    }
}));

// middlewares
app.use(convert(bodyparser))
app.use(convert(json()))
// app.use(convert(logger()))
app.use(logger.config(config.logger));

// static
app.use(convert(koaStatic(path.join(__dirname, '../public'), {
    pathPrefix: ''
})))

app.use(async(ctx, next) => {
    // 获取状态名：启用、禁用、（其他为 无状态）
    ctx.state.getStatusName=function(status){
        logger.debug(config.statusName[status+""]);
        let statusName=typeof config.statusName[status+""]!=="undefined"?config.statusName[status]:"无状态";
        return statusName;
    };
    await next()
})

// views
app.use(views(path.join(__dirname, '../views'), {
    extension: 'ejs'
}))

// 500 error
koaOnError(app, {
    template: 'views/500.ejs'
})

// logger
// app.use(async(ctx, next) => {
//     const start = new Date()
//     await next()
//     const ms = new Date() - start
//     console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })



// app.use(body({
//     encoding: 'utf-8',
//     uploadDir: path.join(__dirname, 'uploads'),
//     keepExtensions: true,
//     formLimit: '1mb'
// }))

app.use(async(ctx, next) => {
    await filter.routes()(ctx, next);
});

// response router
app.use(async(ctx, next) => {
    await require('./routes').routes()(ctx, next)
})

// 404
app.use(async(ctx) => {
    ctx.status = 404
    await ctx.render('404')
})

// error logger
app.on('error', async(err, ctx) => {
    console.log('error occured:', err)
})

const port = parseInt(config.port || '8080')
const server = http.createServer(app.callback())

server.listen(port)
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(port + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(port + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
})
server.on('listening', () => {
    console.log('Listening on port: %d', port)
});

var server1 = new grpc.Server();
server1.addProtoService(serviceIntf(), serviceImpl());
server1.bind('0.0.0.0:9091', grpc.ServerCredentials.createInsecure());
server1.start();

export default app