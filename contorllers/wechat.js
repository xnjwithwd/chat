const config = require('../config/config');
const wechatMiddle = require('../lib/middleware');
const {reply} = require('../lib/reply');

exports.message = async (ctx,next)=>{
    const middle = wechatMiddle(config.wechat,reply);
    await middle(ctx,next);
};
