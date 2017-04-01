/**
 * Created by pc on 2016/12/30.
 */
var util = require('util');
var Proxy = require('./lib/index').Proxy;
import {logger} from "../../lib/log/logger";

/*url : 'http://192.168.92.185/leave-compute-service/user/userService'
method : getUserLeaveInfo
args : ['123456']
*/
export var request = function (url, method, args) {
    var promise = new Promise(function (resolve, reject) {
        var proxy = new Proxy(url);
        proxy.invoke(method, args, async function (err, data) {
            if (err) {
                logger.error('hessian invoke error : url(%s), method(%s), args(%s)', url, method, args);
                logger.error(err);
                reject(err);
            }
            else if (!data) {
                logger.error('hessian null data :  url(%s), method(%s), args(%s)', url, method, args);
                reject('null data');
            }else{
                logger.info('hessian success : url(%s), method(%s)', url, method);
                resolve(data);
            }
        });
    });
    return promise;
}