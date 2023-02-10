/*
http://wap.js.10086.cn/vw/navbar/market_summer5g_new?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_用5G领流量_领取
cron:45 55 9 6 * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const sendWX = require('./function/lcwx')

const $ = new Env('江苏移动_用5G领流量_领取')

const js10086 = require('./app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366  Jsmcc/1.0 ua=jsmcc&loginmobile=0a5b99bfb7fb26214a146094942d4d91&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&platform=iphone&channel=sd&ch=03&version=8.4.9&netmode=WiFi&time=20220308151203&lng=7effded641d49c4f&lat=7effded641d49c4f&poi=(null)&cityCode=(null)&JType=0&platformExpland=iPhone%208&idfaMd5=CB272611-A585-4786-9DE1-23BC50B73007&cmtokenid=E0157A381A2741979E9AB324F2370CC3@js.ac.10086.cn'
let wxid

!(async () => {
  $.msg = ''
  const Y5GLLLConfig = (process.env.Y5GLLLConfig || '').split('&')
  if (Y5GLLLConfig.length != 3) {
    console.log(`参数配置错误: ${process.env.Y5GLLLConfig}`)
    return
  }
  const JS_WX_ID = Y5GLLLConfig[1]
  const userPhone = Y5GLLLConfig[0]
  if (!userPhone || !JS_WX_ID) {
    console.log(`手机号或微信号为空，不执行`)
    return
  }
  wxid = JS_WX_ID

  const smsCode = Y5GLLLConfig[2]
  if (!smsCode) {
    console.log(`短信验证码为空，结束运行`)
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

  $.msg += `\n\n`
  await receive(smsCode)

  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

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
      resolve(ret)
    })
  })
}

function receive (smsCode) {
  return new Promise((resolve, reject) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
    const day = now.getDate() < 10 ? '0' + (now.getDate()) : now.getDate()
    const hour = now.getHours() < 10 ? '0' + (now.getHours()) : now.getHours()
    const minute = now.getMinutes() < 10 ? '0' + (now.getMinutes()) : now.getMinutes()
    const seconds = now.getSeconds() < 10 ? '0' + (now.getSeconds()) : now.getSeconds()
    const orderTime = `${year}${month}${day}${hour}${minute}${seconds}`
    const body = {
      "wapContext": {
        "channel": "wap",
        "netType": "",
        "optType": "1",
        "bizCode": "market_summer5g_new",
        "pageCode": "market_summer5g_new",
        "markCdeo": "TxGuddOIS7WXoueQNSkvAQ==-market_summer5g_new-market_summer5g_new-1675658755517",
        "subBizCode": "market_summer5g_new",
        "effect": "",
        "verifyCode": smsCode
      },
      "orderActionLog": `是否勾选协议:是;勾选时间是：${orderTime}534;是否输入验证码:是;`,
      "orderTime": `${orderTime}388`,
      "smsCode": smsCode
    }

    const options = {
      'url': `https://wap.js.10086.cn/vw/gateway/biz/marketSummer5gNew/handle`,
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
      console.log('handle: ' + data)
      data = JSON.parse(data)
      let ret = false
      if (data && data.code == '200') {
      
        ret = data.success == '0'
        let msg
        if (ret) {
          msg = `流量领取成功: ${data.data.priceName}`
        } else {
          msg = `流量领取失败: ${data.data.errorMsg}`
        }
        $.msg += `${msg}\n`
        console.log(`${msg}`)

        sendWX(msg, [wxid])
      }
      resolve(ret)
    })
  })
}