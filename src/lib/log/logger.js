import log4js from 'log4js'
import path from 'path';
import fs from 'fs-extra';
import util from 'util';

import _config from '../../config'
import _package from '../../../package.json'

// 日志分类：访问、业务（暂不使用）、应用、系统
const LOG_CATEGORY = {ACCESS: 'acc', BUSINESS: 'biz', APPLICATION: 'app', SYS : 'sys'};

// 日志输出格式
const ACCESS_FORMAT = _package.name + ' ' + _package.version + ' :remote-addr - ":method :url HTTP/:http-version" ":user-agent" ":referrer" :status :content-length  :response-time ms';
// const BUSINESS_FORMAT = '[user::user-id] [session::session-id] - :operation';
// const APPLICATION_FORMAT = '":file-name"->:oper-method :log-msg :error';

const DEFAULT_DIR = path.join(__dirname, '../../logs');

const DEFAULT_APP_LOG_LEVEL = _config.logger.appLogLevel;

const LOG_CONFIG = {
    appenders: [
        {
            type: 'console',
            category: ['console','acc','app', 'sys', 'biz'],
            "layout": {
                "type": "pattern",
                "pattern": "(%x{pid})[%d] [%[%5.5p%]] (" + _package.name + "-" + _package.version + ")[%c] %m",
                "tokens": {
                    "pid" : function() { return process.pid; }
                }
            }
        },
        {
            type: 'dateFile',
            filename: LOG_CATEGORY.ACCESS,
            pattern: "/acc.yyyyMMdd.log",
            maxLogSize: 10 * 1024 * 1024,   // 10Mb
            alwaysIncludePattern: true,
            numberBackups: 15,
            category: LOG_CATEGORY.ACCESS,
            "layout": {
                "type": "pattern",
                "pattern": "(%x{pid})[%d] [%p] (" + _package.name + "-" + _package.version + ")[%c] %m",
                "tokens": {
                    "pid" : function() { return process.pid; }
                }
            }
        },
        {
            type: 'dateFile',
            filename: LOG_CATEGORY.BUSINESS,
            pattern: "/biz.yyyyMMdd.log",
            maxLogSize: 10 * 1024 * 1024,   // 10Mb
            alwaysIncludePattern: true,
            numberBackups: 15,
            category: LOG_CATEGORY.BUSINESS,
            "layout": {
                "type": "pattern",
                "pattern": "(%x{pid})[%d] [%p] (" + _package.name + "-" + _package.version + ")[%c] %m",
                "tokens": {
                    "pid" : function() { return process.pid; }
                }
            }
        },
        {
            type: 'dateFile',
            filename: LOG_CATEGORY.SYS,
            pattern: "/sys.yyyyMMdd.log",
            maxLogSize: 10 * 1024 * 1024,   // 10Mb
            alwaysIncludePattern: true,
            numberBackups: 15,
            category: LOG_CATEGORY.SYS,
            "layout": {
                "type": "pattern",
                "pattern": "(%x{pid})[%d] [%p] (" + _package.name + "-" + _package.version + ")[%c] %m",
                "tokens": {
                    "pid" : function() { return process.pid; }
                }
            }
        },
        {
            type: 'dateFile',
            filename: LOG_CATEGORY.APPLICATION,
            pattern: "/app.yyyyMMdd.log",
            maxLogSize: 10 * 1024 * 1024,   // 10Mb
            alwaysIncludePattern: true,
            numberBackups: 15,
            category: LOG_CATEGORY.APPLICATION,
            "layout": {
                "type": "pattern",
                "pattern": "(%x{pid})[%d] [%p] (" + _package.name + "-" + _package.version + ")[%c] %m",
                "tokens": {
                    "pid" : function() { return process.pid; }
                }
            }
        },
        {
            type: 'logLevelFilter',
            level: 'WARN',
            appender: {
                type: 'dateFile',
                filename: LOG_CATEGORY.APPLICATION,
                pattern: "/warn.yyyyMMdd.log",
                maxLogSize: 10 * 1024 * 1024,   // 10Mb
                alwaysIncludePattern: true,
                numberBackups: 15,
                category: LOG_CATEGORY.APPLICATION,
                "layout": {
                    "type": "pattern",
                    "pattern": "(%x{pid})[%d] [%p] (" + _package.name + "-" + _package.version + ")[%c] %m",
                    "tokens": {
                        "pid" : function() { return process.pid; }
                    }
                }
            }
        },
        {
            type: 'logLevelFilter',
            level: 'ERROR',
            appender: {
                type: 'dateFile',
                filename: LOG_CATEGORY.APPLICATION,
                pattern: "/error.yyyyMMdd.log",
                maxLogSize: 10 * 1024 * 1024,   // 10Mb
                alwaysIncludePattern: true,
                numberBackups: 15,
                category: LOG_CATEGORY.APPLICATION,
                "layout": {
                    "type": "pattern",
                    "pattern": "(%x{pid})[%d] [%p] (" + _package.name + "-" + _package.version + ")[%c] %m",
                    "tokens": {
                        "pid" : function() { return process.pid; }
                    }
                }
            }
        }
    ],
    "replaceConsole": false,
};

var acc_logger = log4js.getLogger(LOG_CATEGORY.ACCESS);
var biz_logger = log4js.getLogger(LOG_CATEGORY.BUSINESS);
var app_logger = log4js.getLogger(LOG_CATEGORY.APPLICATION);
var sys_logger = log4js.getLogger(LOG_CATEGORY.SYS);
var logger = {
    biz : acc_logger,
    acc : acc_logger,
    app : app_logger,
    sys : sys_logger
};

/**
 * IBD业务下基于KOA框架日志中间件
 * @param customLogConfig
 * @returns {function(*=, *)}
 */
logger.config = function (customLogConfig) {
    let logConfig = setLoggerConfig(customLogConfig)
    checkLogDirExists(logConfig);
    log4js.configure(logConfig);
    app_logger.setLevel(logConfig.appLogLevel);

    // 日志中间件
    return async(ctx, next) => {
        const start = new Date();
        await next()
        ctx.responseTime = new Date() - start;
        let logLineStr = formatLogContent(ACCESS_FORMAT, combineTokens(ctx));
        if (ctx.res.statusCode >= 400) {
            acc_logger.error(logLineStr);
        } else if (ctx.res.statusCode >= 300) {
            acc_logger.warn(logLineStr);
        } else {
            acc_logger.info(logLineStr);
        }
    }
}

function checkInit(){
    if(!app_logger){
        logger.config(_config.logger)
    }
}
logger.debug = function (obj, ...args) {
    checkInit();
    let msg = obj;
    for(let i = 0; i < args.length; i++)
        msg = util.format(msg, args[i]);
    app_logger.debug(msg);
};

logger.info = function (obj, ...args) {
    checkInit();
    let msg = obj;
    for(let i = 0; i < args.length; i++)
        msg = util.format(msg, args[i]);
    app_logger.info(msg);
};

logger.warn = function (obj, ...args) {
    checkInit();
    let msg = obj;
    for(let i = 0; i < args.length; i++)
        msg = util.format(msg, args[i]);
    app_logger.warn(msg);
};

logger.error = function (obj, ...args) {
    checkInit();
    let msg = obj;
    for(let i = 0; i < args.length; i++)
        msg = util.format(msg, args[i]);
    app_logger.error(msg);
};

/**
 * 检查各类别日志文件夹是否存在，不存在时创建
 * @param logConfig
 */
function checkLogDirExists(logConfig) {
    for (let category in LOG_CATEGORY) {
        let categoryPath = logConfig.logDirPath + '/' + LOG_CATEGORY[category];
        if (!fs.ensureDir(categoryPath)) {
            fs.mkdirsSync(categoryPath);
        }
    }
}

/**
 * 配置日志参数
 * @param customConfig
 * @returns {*}
 */
function setLoggerConfig(customConfig) {
    let logConfig = LOG_CONFIG;
    logConfig.logDirPath = customConfig.logDirPath || DEFAULT_DIR;
    logConfig.appLogLevel = customConfig.appLogLevel || DEFAULT_APP_LOG_LEVEL;
    for (let i = 0; i < logConfig.appenders.length; i++) {
        if (!logConfig.appenders[i].appender) {
            logConfig.appenders[i].filename = logConfig.logDirPath + '/' + logConfig.appenders[i].filename;
        } else {
            logConfig.appenders[i].appender.filename = logConfig.logDirPath + '/' + logConfig.appenders[i].appender.filename;
        }
    }
    return logConfig;
}
/**
 * 格式化日志内容
 * @param formatStr 日志格式定义字符串
 * @param tokens    标记替换内容
 */
function formatLogContent(formatStr, tokens) {
    for (let i = 0; i < tokens.length; i++) {
        formatStr = formatStr.replace(tokens[i].token, tokens[i].replacement);
    }
    return formatStr;
}


function combineAppTokens(logObj) {
    let tokens = [];
    tokens.push({token: ':file-name', replacement: logObj.fileName || ''});
    tokens.push({token: ':oper-method', replacement: logObj.methodName || ''});
    tokens.push({token: ':log-msg', replacement: logObj.logMsg || ''});
    tokens.push({token: ':error', replacement: logObj.error || ''});
    return tokens;
}

/**
 * Parse log tokens.
 * @param ctx Context
 */
function combineTokens(ctx) {
    let tokens = [];
    tokens.push({token: ':date', replacement: new Date().toUTCString()});
    tokens.push({
        token: ':remote-addr', replacement: ctx.headers['x-forwarded-for'] || ctx.ip || ctx.ips ||
        (ctx.socket && (ctx.socket.remoteAddress || (ctx.socket.socket && ctx.socket.socket.remoteAddress)))
    });
    tokens.push({token: ':method', replacement: ctx.method});
    tokens.push({token: ':url', replacement: ctx.originalUrl});
    tokens.push({token: ':http-version', replacement: ctx.req.httpVersionMajor + '.' + ctx.req.httpVersionMinor});
    tokens.push({
        token: ':status',
        replacement: ctx.response.status || ctx.response.__statusCode || ctx.res.statusCode
    });
    tokens.push({
        token: ':content-length', replacement: (ctx.response._headers && ctx.response._headers['content-length']) ||
        (ctx.response.__headers && ctx.response.__headers['Content-Length']) ||
        ctx.response.length || '-'
    });
    tokens.push({token: ':referrer', replacement: ctx.headers.referer || ''});
    tokens.push({token: ':user-agent', replacement: ctx.headers['user-agent']});
    tokens.push({token: ':response-time', replacement: ctx.responseTime});
    return tokens;
}

export {logger};

/*
 %r - time in toLocaleTimeString format
 %p - log level
 %c - log category
 %h - hostname
 %m - log data
 %d - date in various formats
 %% - %
 %n - newline
 %x{<tokenname>} - add dynamic tokens to your log. Tokens are specified in the tokens parameter
 %[ and %] - define a colored bloc

*/