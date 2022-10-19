/*
江苏移动_用5G领流量
cron:45 55 9 5 * *
*/
const Env = require('./function/01Env')
const $ = new Env('江苏移动_用5G领流量')

const { ua, options, initCookie } = require('./function/01js10086_common')

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    $.index = i
    await initCookie($, i)

    let r = await initPage()
    if (r) {
      r = await lottery()
      if (r) {
        await receive()
      }
    } else {
      $.msg += `流量领取失败: 未满足领取条件\n`
    }
    console.log()
    $.msg += `\n\n`
  }
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
        'User-Agent': ua[$.index]
      },
      body: JSON.stringify(body)
    }
    $.post(options, async (err, resp, data) => {
      // console.log(`initPage: ${data}`)
      if (err) throw new Error(err)
      data = JSON.parse(data)
      let ret = false
      if (data.success == '0' && data.code == '200' && data.data) {
        if (data.data.checkCode) {
          $.msg += `查询结果：${data.data.checkMessage}\n`
          console.log(`查询结果：${data.data.checkMessage}\n`)
          ret = data.data.useFlow > 0
        }
      }
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
        'User-Agent': ua[$.index]
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
      
        ret = data.isGet == 0
        if (ret) {
          $.msg += `抽奖成功: ${data.data.priceName}\n`
          console.log(`抽奖成功: ${data.data.priceName}`)
        } else {
          $.msg += `抽奖成功: ${data.data.errorMsg}\n`
          console.log(`抽奖成功: ${data.data.errorMsg}`)
        }
      }
      resolve(ret)
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
        'User-Agent': ua[$.index]
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