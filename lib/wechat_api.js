const request = require('request-promise');


const base = 'https://api.weixin.qq.com/cgi-bin/';
const additionURL = {
    accessToken: base + 'token?grant_type=client_credential',
    ticket: {
        get: base + 'ticket/getticket?'
    },
    //模板消息接口
    template: {
        // 设置所属行业 http请求方式: POST        https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token=ACCESS_TOKEN
        set_industry: base + 'template/api_set_industry?',
        //获取设置的行业信息 http请求方式：GET     https://api.weixin.qq.com/cgi-bin/template/get_industry?access_token=ACCESS_TOKEN
        get_industry: base + 'template/get_industry?',
        //获得模板ID  http请求方式: POST         https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=ACCESS_TOKEN
        api_add_template: base + 'template/api_add_template?',
        //获取模板列表  http请求方式：GET         https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=ACCESS_TOKEN
        get_all_private_template: base + 'template/get_all_private_template?',
        //删除模板  http请求方式：POST           https://api.weixin.qq.com/cgi-bin/template/del_private_template?access_token=ACCESS_TOKEN
        del_private_template: base + 'template/del_private_template?',
        //发送模板消息  http请求方式: POST       https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=ACCESS_TOKEN
        message_send: base + 'message/template/send?'
    }
};

module.exports = class WechatApi {

    constructor(options) {
        this.opts = Object.assign({}, options);
        this.appID = options.appID;
        this.appSecret = options.appSecret;
        this.pickAccesstoken = options.searchAccessToken;
        this.saveDBAccessToken = options.saveAccessToken;
        this.updateDBAccessToken = options.updateAccessToken;
        this.saveUserAppid = options.saveUserAppid;
        this.searchUserAppid = options.searchUserAppid;
        this.delUserAppid = options.delUserAppid;

        this.getAccessToken();
    }

    /**
     * 封装用来请求接口的入口方法
     * @param operation 方法名
     * @param args 参数
     * @returns {Promise<*>}
     */
    async handle(operation, ...args) {
        const token = await this.getAccessToken();
        const options = await this[operation](token.access_token, ...args);
        return await this.request(options);
    }

    async request(options) {
        options = Object.assign({}, options, {json: true});
        try {
            return await request(options);
        } catch (e) {
            console.log('request fails!!!!');
            console.error(e)
        }
    }

    /**
     * 获取access_token
     * @returns {Promise<void>}
     */
    async getAccessToken() {
        let data= await this.pickAccesstoken();
        // console.log('in getAccessToken data:',data);
        data = data[0];
        if (typeof (data) == 'undefined') {
            data = await this.saveAccessToken();
        }
        let flag = await this.isValidToken(data);
        if (!flag) {
            data = await this.updateAccessToken();
        }
        return data;
    }

    /**
     * 如果数据库中没有数据，则生成一个并保存
     * @returns {Promise<void>}
     */
    async saveAccessToken() {
        const url = `${additionURL.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
        const data = await this.request({url});
        console.log('in saveAccessToken 原 : ', data);
        const now = new Date().getTime();
        data.expires_in = now + (data.expires_in - 20) * 1000;

        await this.saveDBAccessToken(data);//数据存入数据库
        console.log('in saveAccessToken 后 : ', data);
        return data;
    };

    async updateAccessToken() {
        console.log('更新access_token');
        const url = `${additionURL.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
        console.log('url:',url);
        const data = await this.request({url});
        console.log(data);
        const now = new Date().getTime();
        data.expires_in = now + (data.expires_in - 20) * 1000;
        await this.updateDBAccessToken(data);//数据存入数据库
        return data;
    }

    /**
     * 检查token的有效性
     * @param token
     * @returns {boolean}
     */
    async isValidToken(token) {
        if (!token || !token.access_token || !token.expires_in) {
            return false
        }
        return new Date().getTime() < token.expires_in;
    }

    /**
     * 测试模板信息
     * @param token
     * @param openid
     * @returns {Promise<{method: string, body: {touser: *, data: {data: {color: string, value: *}, remark: {color: string, value: string}, first: {color: string, value: string}}, template_id: string}, url: string}>}
     */
    async templateMessageSend(token, openid) {
        const url = additionURL.template.message_send + 'access_token=' + token;
        const dataFromDatabase = await this.getAccessToken();
        const access_token = dataFromDatabase.access_token;
        // console.log(access_token);
        const body = {
            touser: openid,
            template_id: "btJS4fj1Nj39JnVCFcnkx_HpOtAeEqXT-xWhYxWYCjI",

            // "url":"http://weixin.qq.com/download",
            // "miniprogram":{
            //     "appid":"xiaochengxuappid12345",
            //     "pagepath":"index?foo=bar"
            // },
            data: {
                first: {
                    value: "恭喜你测试成功！",
                    color: "#173177"
                },
                data: {
                    value: access_token,
                    color: "#173177"
                },
                remark: {
                    "value": "欢迎再次测试！",
                    "color": "#173177"
                }
            }
        };
        console.log(body);
        return {method: 'POST', url, body}
    }
};