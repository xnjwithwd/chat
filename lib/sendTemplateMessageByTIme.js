/**
 * 发送模板消息
 * @returns {Promise<void>}
 */
module.exports = async () => {
    let wechat_config = require('../config/wechat_config');
    let client = wechat_config.getWechat();

    setInterval(() => {
        let date = new Date();
        let hour = date.getHours();
        console.log('hour:  ',hour);
        let localTimeString = date.toLocaleTimeString();
        console.log('localTimeString: ',localTimeString);//18:31:48
        console.log('localeDateString: ',date.toLocaleDateString());// 2019-2-12
        console.log('localString: ',date.toLocaleString());//2019-2-12 18:31:48
        console.log('string: ',date.toString());// Tue Feb 12 2019 18:31:48 GMT+0800 (GMT+08:00)
        console.log('day: ',date.getDay());//星期几，是一个数字，1，2，3，4，5，6，7
        console.log('date: ',date.getDate());//得到的时几号，1，2，3，4，.....31
        console.log('UTCDay: ',date.getUTCDay());//与getDay()一样，得到的是星期几
        if(hour === 8){

        }
    }, 10000);

    let users = await client.searchUserAppid();
    console.log(users);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!');
    for (let i = 0; i < users.length; i++) {
        client.handle('templateMessageSend', users[i].appid);
    }
};