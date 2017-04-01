/**
 * Created by libing on 16-11-21.
 */
import Router from "koa-router";
var logger = require("../lib/log/logger").logger;
var url = require("url");
var minimatch = require("minimatch");
// import {getUnionID, checkBindingWechat} from '../controllers/bindController'

const router = new Router();

const allowOrder = [
    "/css",
    "/dist",
    "/binding"
    ,'/dobinding'
];

router.all('/*', async(ctx, next) => {
    let pathname = url.parse(ctx.request.url).pathname;
    logger.debug('filter url : %s', pathname);
    for (let i = 0; i < allowOrder.length; i++) {
        if (pathname == allowOrder[i] || pathname.indexOf(allowOrder[i]) != -1) {
            await next();
            return;
        }
    }

    let unionID = await getUnionID(ctx);
/*
    let hasBind = await checkBindingWechat(ctx, unionID);
    if (!hasBind) {
        await ctx.render('/binding.html');
        return;
    }
*/
    await next();
});

export default router;