/**
 * Created by root on 17-3-31.
 */
import {logger} from '../lib/log/logger';

var grpc = require('grpc');
console.log(__dirname);
console.log('-------------------------');
var pkg = grpc.load(__dirname + '/../../src/proto/helloworld.proto').helloworld;
// var protoDescriptor = grpc.load('../proto/helloworld.proto');
/*var examples = protoDescriptor.examples;

var server = grpc.buildServer([pkg.Simple.service]);*/

function sayHello(call, callback){
    logger.info('revice sayHello grpc call.....');
    callback(null, doHello(call.request));
}

function doHello(helloRequest){
    logger.info(helloRequest.name);
    var helloReply = {
        message : '返回消息内容：12'
    };
    logger.info('return message');
    return helloReply;
}

export var serviceIntf = function(){
    return pkg.Simple.service;
}

export var serviceImpl = function () {
    return {sayHello : sayHello};
}

export var startServer = function (){
    var server = new grpc.Server();
    server.addProtoService(pkg.Simple.service, {sayHello : sayHello});
    server.bind('0.0.0.0:9091', grpc.ServerCredentials.createInsecure());
    // server.start();
    return server;
}
// startServer();