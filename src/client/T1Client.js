/**
 * Created by root on 17-4-1.
 */
var grpc = require('grpc');
// var proto_hello = grpc.load('../proto/helloworld.proto').helloworld;

var protoDescriptor = grpc.load(__dirname + '/../proto/helloworld.proto');
var pkg = protoDescriptor.helloworld;//full package


var stub = new pkg.Simple('localhost:9091', grpc.credentials.createInsecure());
var helloRequest = {name : 'node 请求数据'};
stub.sayHello(helloRequest, function(err, helloReply){
   if(err){
       console.info(err);
   } else{
       console.info(helloReply.message);
   }
});
