/*
http://wap.js.10086.cn/vw/navbar/market_summer5g_new?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_用5G领流量
cron:12 12 29 2 ?
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const sendWX = require('./function/lcwx')

const $ = new Env('江苏移动_用5G领流量')

const js10086 = require('./app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366  Jsmcc/1.0 ua=jsmcc&loginmobile=0a5b99bfb7fb26214a146094942d4d91&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&platform=iphone&channel=sd&ch=03&version=8.4.9&netmode=WiFi&time=20220308151203&lng=7effded641d49c4f&lat=7effded641d49c4f&poi=(null)&cityCode=(null)&JType=0&platformExpland=iPhone%208&idfaMd5=CB272611-A585-4786-9DE1-23BC50B73007&cmtokenid=E0157A381A2741979E9AB324F2370CC3@js.ac.10086.cn'


!(async () => {
  $.msg = ''
  const Y5GLLLConfig = (process.env.Y5GLLLConfig || '').split('&')
  if (Y5GLLLConfig.length != 2) {
    console.log(`参数配置错误: ${process.env.Y5GLLLConfig}, ${JSON.stringify(Y5GLLLConfig)}`)
    return
  }
  const JS_WX_ID = Y5GLLLConfig[1]
  const userPhone = Y5GLLLConfig[0]
  if (!userPhone || !JS_WX_ID) {
    console.log(`手机号或微信号为空，不执行`)
    return
  }

  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    $.bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])
    if (userPhone == $.phone) {
      break
    }
  }

  if (!$.phone || !$.bodyParam) {
    console.log(`不存在此号码，结束运行`)
    return
  }
  
  $.msg += `<font size="5">${$.phone}</font>\n`
  if (!$.phone || !$.bodyParam) {
    $.msg += `登陆参数配置不正确\n`
    return
  }

  console.log(`${$.phone}获取Cookie：`)
  $.setCookie = await getMobieCK($.phone, $.bodyParam)
    
  let r = await initPage()
  if (r.isGet != '1') {
    console.log(`领取奖励...`)
    r = await lottery()
    if (r && r.checkCode == 'E10003') {
      console.log(`发送验证码...`)
      await sendSms()
    }
  } else {
    if (r.checkCode == 'E10003') {
      // 查询列表，是否已经激活
      const isHandled = await summer5gRecords()
      if (isHandled) {
        sendWX(`【${$.name}】\n本月已领取，下个月6号之后再来`, [JS_WX_ID])
      } else {
        // 已经领取，需要短信验证码
        console.log(`发送验证码...`)
        await sendSms()
      }
    }
  }
  console.log()
  $.msg += `\n\n`

  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

/**
 * 查询活动信息
 * {
     "success": "0",
     "message": "操作成功",
     "code": "200",
     "data": {
         "useFlowBefore": 0,
         "useFlow": 0,
         "checkMessage": "非1元100g目标客用户，引导打开5G开关，使用5G流量，达到1GB以上，下个月可以来领最高5GB流量***flow5g:0",
         "dayBefore": "03月11日",
         "userMobile": "152****0683",
         "checkCode": "E10005/E10004"
     },
     "logicCode": null,
     "systemCode": null,
     "timestamp": 1647046002081,
     "retcode": null,
     "retmsg": null
   }
 * 
 */
function initPage () {
  return new Promise((resolve, reject) => {
    const body = {
      "fxnum": "839095",
      "wapContext": {
          "netType": "",
          "optType": "3",
          "bizCode": "market_summer5g_new",
          "pageCode": "market_summer5g_new",
          "markCdeo": "xsQiPyHZCwkt6ZUuPmq8BQ==-market_summer5g_new-market_summer5g_new-1647046002028",
          "effect": "",
          "verifyCode": "",
          "channel": "wap",
          "subBizCode": "market_summer5g_new"
      }
    }
    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/marketSummer5gNew/initPage`,
      'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'br, gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Referer': 'https://wap.js.10086.cn/',
        'Accept-Language': 'en-us',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': $.setCookie,
        'User-Agent': ua
      },
      body: JSON.stringify(body)
    }
    $.post(options, async (err, resp, data) => {
      console.log(`initPage: ${data}`)
      if (err) throw new Error(err)
      data = JSON.parse(data)
      if (data.success == '0' && data.code == '200' && data.data) {
        $.msg += `查询结果：${data.data.checkMessage}\n`
        console.log(`查询结果：${data.data.checkMessage}\n`)
      }
      resolve(data.data)
    })
  })
}

/**
 * {
  "success": "0",
  "message": "操作成功",
  "code": "200",
  "data": {
    "month": "202302",
    "summer5gRecords": [{
      "id": "summer5g82554ca74d704feda94cc3c6de6baf7f8144",
      "mobile": null,
      "city": "20",
      "time": "20230206085109",
      "month": "202302",
      "priceFlow": "5120",
      "priceName": "5GB",
      "status": "0",
      "checkCode": null,
      "checkMsg": null,
      "code": null,
      "msg": null,
      "fxNum": null,
      "fxMobile": null
    }]
    }
 * }
 */
function summer5gRecords() {
  return new Promise((resolve, reject) => {
    const body = {
      "wapContext": {
        "channel": "wap",
        "netType": "",
        "optType": "3",
        "bizCode": "market_summer5g_new",
        "pageCode": "market_summer5g_new",
        "markCdeo": "TxGuddOIS7WXoueQNSkvAQ==-market_summer5g_new-market_summer5g_new-1675658755517",
        "subBizCode": "market_summer5g_new",
        "effect": "",
        "verifyCode": ""
      }
    }
    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/marketSummer5gNew/summer5gRecords`,
      'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'br, gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Referer': 'https://wap.js.10086.cn/',
        'Accept-Language': 'en-us',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': $.setCookie,
        'User-Agent': ua
      },
      body: JSON.stringify(body)
    }
    $.post(options, async (err, resp, data) => {
      console.log(`initPage: ${data}`)
      if (err) throw new Error(err)
      data = JSON.parse(data)
      let ret = false
      if (data.success == '0' && data.code == '200' && data.data) {
        const summer5gRecords = data.data.summer5gRecords
        const month = data.data.month
        const founds = summer5gRecords.filter(e => e.month == month)

        // 没记录或者已领取但未提交
        ret = founds.length == 1 && founds[0].status == 1
      }
      console.log(`是否已领取：${ret}`)
      resolve(ret)
    })
  })
}

/*{
  "success": "0",
  "message": "操作成功",
  "code": "200",
  "data": {
    "useFlowBefore": 0,
    "isGet": "0",
    "useFlow": 514,
    "checkMessage": "未领取，可领取***flow5g:514|5GB",
    "dayBefore": "05月05日",
    "success": "S20001",
    "rank": "20.3%",
    "priceName": "5GB",
    "checkCode": "E10004"
  },
  "logicCode": null,
  "systemCode": null,
  "timestamp": 1651839588026,
  "retcode": null,
  "retmsg": null
}*/
function lottery () {
  return new Promise((resolve, reject) => {
    const body = {
      "fxnum": "839095",
      "wapContext": {
          "netType": "",
          "bizCode": "market_summer5g_new",
          "pageCode": "market_summer5g_new",
          "markCdeo": "TxGuddOIS7WXoueQNSkvAQ==-market_summer5g_new-market_summer5g_new-1647069952498",
          "effect": "",
          "verifyCode": "",
          "optType": "1",
          "channel": "wap",
          "subBizCode": "market_summer5g_new"
      }
    }
    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/marketSummer5gNew/lottery`,
      'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'br, gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Referer': 'https://wap.js.10086.cn/',
        'Accept-Language': 'en-us',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': $.setCookie,
        'User-Agent': ua
      },
      'body': JSON.stringify(body)
    }
    // console.log(JSON.stringify(options))
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      console.log('lottery: ' + data)
      data = JSON.parse(data)
      let ret = false
      if (data && data.code == '200') {
      
        ret = data.data.isGet == 0
        if (ret) {
          $.msg += `抽奖成功: ${data.data.priceName}\n`
          console.log(`抽奖成功: ${data.data.priceName}`)
        } else {
          $.msg += `抽奖成功: ${data.data.errorMsg}\n`
          console.log(`抽奖成功: ${data.data.errorMsg}`)
        }
      }
      resolve(data.data)
    })
  })
}


function receive () {
  return new Promise((resolve, reject) => {
    const body = {
      "fxnum": "839095",
      "wapContext": {
          "netType": "",
          "bizCode": "market_summer5g_new",
          "pageCode": "market_summer5g_new",
          "markCdeo": "TxGuddOIS7WXoueQNSkvAQ==-market_summer5g_new-market_summer5g_new-1647069952498",
          "effect": "",
          "verifyCode": "",
          "optType": "1",
          "channel": "wap",
          "subBizCode": "market_summer5g_new"
      }
    }
    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/marketSummer5gNew/receive`,
      'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'br, gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Referer': 'https://wap.js.10086.cn/',
        'Accept-Language': 'en-us',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': $.setCookie,
        'User-Agent': ua
      },
      'body': JSON.stringify(body)
    }
    // console.log(JSON.stringify(options))
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      // console.log('receive: ' + data)
      data = JSON.parse(data)
      let ret = false
      if (data && data.code == '200') {
      
        ret = data.success == '0' 
        if (ret) {
          $.msg += `流量领取成功: ${data.data.priceName}\n`
          console.log(`流量领取成功: ${data.data.priceName}`)
        } else {
          $.msg += `流量领取失败: ${data.data.errorMsg}\n`
          console.log(`流量领取失败: ${data.data.errorMsg}`)
        }
      }
      resolve(ret)
    })
  })
}

function confirmType () {
  return new Promise((resolve, reject) => {
    const body = {
      "bizCode": "8TCYHNEW",
      "wapContext": {
        "channel": "02",
        "netType": "",
        "optType": "3",
        "bizCode": "TCYHNEW",
        "pageCode": "market_summer5g_new",
        "markCdeo": "TxGuddOIS7WXoueQNSkvAQ==-market_summer5g_new-market_summer5g_new-1675644544527",
        "subBizCode": "TCYHNEW",
        "effect": "",
        "verifyCode": ""
      }
    }

    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/confirm/confirmType`,
      'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'br, gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Referer': 'https://wap.js.10086.cn/',
        'Accept-Language': 'en-us',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': $.setCookie,
        'User-Agent': ua
      },
      'body': JSON.stringify(body)
    }
    // console.log(JSON.stringify(options))
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      console.log('confirmType: ' + data)
      data = JSON.parse(data)
      let ret = -1
      if (data && data.code == '200' && data.success == '0' ) {
      
        ret = data.data.confirmType
      }
      resolve(ret)
    })
  })
}

function sendSms () {
  return new Promise((resolve, reject) => {
    const body = {
      "wapContext": {
        "channel": "wap",
        "netType": "",
        "optType": "1",
        "bizCode": "market_summer5g_new",
        "pageCode": "market_summer5g_new",
        "markCdeo": "TxGuddOIS7WXoueQNSkvAQ==-market_summer5g_new-market_summer5g_new-1675644544527",
        "subBizCode": "market_summer5g_new",
        "effect": "",
        "verifyCode": ""
      }
    }

    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/smsVerifyCode/sendSms`,
      'headers': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept-Encoding': 'br, gzip, deflate',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Referer': 'https://wap.js.10086.cn/',
        'Accept-Language': 'en-us',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': $.setCookie,
        'User-Agent': ua
      },
      'body': JSON.stringify(body)
    }
    // console.log(JSON.stringify(options))
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      console.log('sendSms: ' + data)
    })
  })
}

