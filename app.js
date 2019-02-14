const Koa = require('koa');
const config = require('./config/config');
const Router = require('koa-router');

(async ()=>{
    const app = new Koa();
    const router = new Router();

    require('./routes/index')(router);
    app.use(router.routes()).use(router.allowedMethods());

    // let wechat_config = require('./config/wechat_config');
    // let client = wechat_config.getWechat();
    // let users = await client.searchUserAppid();
    // for (let i = 0; i < users.length; i++) {
    //     client.handle('templateMessageSend', users[i].appid);
    // }
    require('./lib/sendTemplateMessageByTIme')();//定时发送模板消息

    app.listen(config.port);
    console.log('listening ',config.port);
})();