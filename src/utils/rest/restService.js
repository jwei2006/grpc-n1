/**
 * Created by libing on 2016/11/3.
 */
var Client = require('node-rest-client').Client;
var client = new Client();
import {logger} from "./../../lib/log/logger";
import {errorMessage} from "./../../utils/error/errorCode";

export var post = function (url, params) {
    var promise = new Promise(function (resolve, reject) {
        var content_len = params.toString().length;
        var args = {
            data: params,
            headers: {
                // 'user-agent': 'NodeJs/ibd_tenant_web',
                /*'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0',
                 'accept': 'text/html,application/xhtml+xml,application/xml;application/json;q=0.9,*!/!*;q=0.8',
                 'accept-language': 'null',
                 'accept-encoding': 'gzip, deflate',
                 'content-length': content_len,
                 'connection': 'keep-alive',*/
                'content-type': 'application/json;charset=UTF-8'
            },
            requestConfig: {
                timeout: 2000,
                noDelay: true,
                keepAlive: true,
                keepAliveDelay: 1000
            },
            responseConfig: {
                timeout: 1000
            }
        };
        logger.debug("rest sapi:::::::::::" + url)
        client.post(url, args, function (data) {
            resolve(data);
        })
            .on('requestTimeout', function (request) {
                let errMsg = errorMessage("CallServiceError", request, "Post请求超时");
                logger.error(__filename + "post" + "请求超时", errMsg);
                reject(errMsg);
            })
            .on('responseTimeout', function (response) {
                let errMsg = errorMessage("CallServiceError", response, "Post应答超时");
                logger.error(__filename + "post" + "应答超时", errMsg);
                reject(errMsg);
            })
            .on('error', function (error) {
                let errMsg = errorMessage("CallServiceError", error, "请求发生错误");
                logger.error(__filename + "post" + "请求发生错误", errMsg);
                reject(errMsg);
            });
    });
    return promise;
}

export var get = function (url) {
    var promise = new Promise(function (resolve, reject) {
        logger.debug("rest sapi:::::::::::" + url)
        client.get(url, "", function (data, response) {
            if (data) {
                resolve(data);
            } else {
                reject(response);
            }
        });
    });
    return promise;
}

export var put = function (url, params) {
    var promise = new Promise(function (resolve, reject) {
        var content_len = params.toString().length;
        var args = {
            data: params,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*!/!*;q=0.8',
                'accept-language': 'null',
                'accept-encoding': 'gzip, deflate',
                'content-length': content_len,
                'content-type': 'application/json;charset=UTF-8',
                'connection': 'keep-alive'
            }
        };
        logger.debug("rest sapi:::::::::::" + url);
        client.put(url, args, function (data, response) {
            if (data) {
                resolve(data);
            } else {
                reject(response);
            }
        });
    });
    return promise;
}

export var del = function (url) {
    var promise = new Promise(function (resolve, reject) {
        logger.debug("rest sapi:::::::::::" + url);
        client.delete(url, "", function (data, response) {
            if (data) {
                resolve(data);
            } else {
                reject(response);
            }
        });
    });
    return promise;
}

export var patch = function (url, params) {
    var promise = new Promise(function (resolve, reject) {
        var content_len = params.toString().length;
        var args = {
            data: params,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*!/!*;q=0.8',
                'accept-language': 'null',
                'accept-encoding': 'gzip, deflate',
                'content-length': content_len,
                'content-type': 'application/json;charset=UTF-8',
                'connection': 'keep-alive'
            }
        };
        client.patch(url, args, function (data, response) {
            if (data) {
                resolve(data);
            } else {
                reject(response);
            }
        });
    });
    return promise;
}


