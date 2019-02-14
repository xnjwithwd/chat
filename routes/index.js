const Wechat = require('../contorllers/wechat');

module.exports = router => {
    router.get('/wx-hear', Wechat.message);//此处不能用use
    router.post('/wx-hear', Wechat.message);
};
