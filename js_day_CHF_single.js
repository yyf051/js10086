/*
江苏移动_查话费
cron:2 2 2 2 2
*/
const Env = require('./function/01Env')
const { initCookie } = require('./function/01js10086_common2')
const BrowserFinger = require('./function/BrowserFinger')
const sendWX = require('./function/lcwx')

const $ = new Env('江苏移动_查话费_机器人版')

const js10086 = require('./function/js10086_chf')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})


!(async () => {
  $.msg = ''  

  const userPhone = process.env.JS_USER_PHONE || ''
  const noticeConfig = JSON.parse(process.env.WX_NOTICE_CONFIG || {})
  const JS_WX_ID = noticeConfig[$.phone] || process.env.JS_WX_ID || ''
  if (!userPhone || !JS_WX_ID) {
    return
  }

  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    $.password = cookie.match(/passwd=([^; ]+)(?=;?)/) && cookie.match(/passwd=([^; ]+)(?=;?)/)[1]
    if (userPhone == $.phone) {
      break
    }
  }

  if (!$.phone || !$.password) {
    return
  }

  $.redMesssgae = '' // 每个账号的警示消息置空
  $.singleMessage = ''

  const success = await initCookie($)
  if (!success) {
    $.msg += `${$.phone}登录失败......\n\n`
    return
  }

  $.msg += `<font size="5">${$.phone}</font>: \n`
  const tips = await queryIndexTopBar()
  console.log(`${$.phone}套餐使用情况如下: \n${tips}\n\n`)
  $.msg += tips
  $.msg += '\n'

  const tips2 = await queryBillInfo()
  console.log(`${$.phone}套餐内容: \n${tips2}\n\n`)
  $.msg += tips2
  $.msg += '\n\n'

  sendWX(`尊敬的${$.phone}用户，您的套餐详情如下：\n${$.singleMessage}`, [JS_WX_ID]) 

  // $.sendNotify($.name, $.msg)

})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

function queryIndexTopBar() {
  return new Promise((resolve) => {

    const date = new Date()
    const mobile = BrowserFinger.encryptByDES($.phone)
    const data = {
      "wapContext": {
        "channel": "",
        "netType": "",
        "optType": "3",
        "bizCode": "INDEX",
        "pageCode": "INDEX",
        "markCdeo": `${mobile}-INDEX-INDEX-${date.getTime()}`,
        "subBizCode": "",
        "effect": "",
        "verifyCode": ""
      }
    }

    const op = {
      url: 'https://wap.js.10086.cn/vw/gateway/biz/indexTopBar',
      headers: { 
        'Connection': 'keep-alive', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache', 
        'Accept': 'application/json, text/plain, */*', 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
        'Content-Type': 'application/json;charset=UTF-8', 
        'Origin': 'https://wap.js.10086.cn', 
        'Sec-Fetch-Site': 'same-origin', 
        'Sec-Fetch-Mode': 'cors', 
        'Sec-Fetch-Dest': 'empty', 
        'Referer': 'https://wap.js.10086.cn/', 
        'Accept-Language': 'zh-CN,zh;q=0.9', 
        'Cookie': $.setCookie
      },
      body: JSON.stringify(data)
    }
    
    $.post(op, async (err, resp, data) => {
      if (err) throw Error(err)
      // console.log(data)

      data = JSON.parse(data)

      resolve(combineMessage(data))
    })
  })
}

function combineMessage(data) {
  if (data.success != '0' || data.code != '200') {
    return ''
  }

  const ret = data.data

  let speech = `\t\t\t\t${ret.commonSpeechDashboard.bordTitle}: ${ret.commonSpeechDashboard.value}${ret.commonSpeechDashboard.unit}\n`
  let gprs = `\t\t\t\t${ret.commonGPRSDashboard.bordTitle}: ${ret.commonGPRSDashboard.value}${ret.commonGPRSDashboard.unit}\n`
  let other = `\t\t\t\t${ret.otherGPRSDashboard.bordTitle}: ${ret.otherGPRSDashboard.value}${ret.otherGPRSDashboard.unit}\n\n`

  const r = '[庆祝]\t\t套餐剩余: \n' + speech + gprs + other
  $.singleMessage += r.replaceAll(/<font size="3" color="red">/gi, '').replaceAll(/<\/font>/gi, '').replaceAll(/\t/gi, '  ')

  return r
}
`尊敬的13584630864用户，您的套餐详情如下：

💹套餐剩余: 
    💨通用通话剩余: 0分钟
    💨通用流量剩余: 586.61MB
    💨其它流量剩余: 0GB
✳套餐及固定费: 
    ➡短信呼(1元): 1.00元
    ➡1元包本地主叫200分钟(09版集团套餐): 0.87元
    ➡10元提速包（提至100M）: 9.28元
    ➡4G飞享18元套餐（2018版）: 17.11元
❌套餐外语音费: 
    💤基本通话费: 6.08元
❌套餐外短彩信费: 
    💤国内（不含港澳台）短信费: 0.10元
❌增值业务费: 
    💤视频彩铃订阅-酷电秀专属6元包: 6.00元

共计: 40.44元
余额: 163.43元`


function queryBillInfo() {
  return new Promise((resolve) => {
    const date = new Date()
    let month = date.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    const queryMonth = '' + date.getFullYear() + month
    const mobile = BrowserFinger.encryptByDES($.phone)
    const data = {
      "wapContext": {
        "channel": "",
        "netType": "",
        "optType": "3",
        "bizCode": "ZDCX",
        "pageCode": "ZDCX",
        "markCdeo": `${mobile}-ZDCX-ZDCX-${date.getTime()}`,
        "subBizCode": "queryBillInfo",
        "effect": "",
        "verifyCode": ""
      },
      mobile,
      queryMonth
    }
    const op = {
      url: 'http://wap.js.10086.cn/vw/gateway/biz/billQuery/queryBillInfo',
      headers: { 
        'Connection': 'keep-alive', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache', 
        'Accept': 'application/json, text/plain, */*', 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
        'Content-Type': 'application/json;charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Referer': 'http://wap.js.10086.cn/', 
        'Accept-Language': 'zh-CN,zh;q=0.9', 
        'Cookie': $.setCookie  
      },
      body : JSON.stringify(data)
    }
    // console.log(JSON.stringify(op))
    // console.log()
    // console.log()
    
    $.post(op, async (err, resp, data) => {
      if (err) throw Error(err)
      // console.log(data)
      // console.log()
      // console.log()

      data = JSON.parse(data)

      resolve(combineMessage2(data))
      // resolve(true)
    })
  })
}

function combineMessage2(data) {
  if (data.success != '0' || !data.data) {
    return ''
  }
  const billData = data.data
  const billInfo = billData.billInfo
  const feeList = billInfo.feeDetailInfo

  let redMesssgae = ''
  let message = ''
  for (let i = 0; i < feeList.length; i++) {
    const fee = feeList[i]
    if (fee.levelDbiName.indexOf("套餐外") > -1 || fee.levelDbiName.indexOf("增值") > -1) {
      message += `[庆祝]\t\t<font size="3" color="red">${fee.levelDbiName}:</font>\n`
      const feeDetails = fee.feeDetails
      for (let j = 0; j < feeDetails.length; j++) {
        const feeDetail = feeDetails[j]
        message += `\t\t\t\t<font size="3" color="red">${feeDetail.feeName}: ${feeDetail.fee}元</font>\n`
        redMesssgae += `\t\t${feeDetail.feeName}: ${feeDetail.fee}元\n`
      }
    } else {
      message += `[庆祝]\t\t${fee.levelDbiName}:\n`
      const feeDetails = fee.feeDetails
      for (let j = 0; j < feeDetails.length; j++) {
        const feeDetail = feeDetails[j]
        message += `\t\t\t\t${feeDetail.feeName}: ${feeDetail.fee}元\n`
      }
    }
  }
  message += '\n'
  message += `本月消费: ${billInfo.actualPay}${billInfo.unit}\n`
  message += `当前余额: ${billData.accountBalance}元`

  $.redMesssgae = redMesssgae
  $.singleMessage += message.replaceAll(/<font size="3" color="red">/gi, '').replaceAll(/<\/font>/gi, '').replaceAll(/\t/gi, '  ')

  return message
}

function getNumberEmoj(num) {
  if (num == 1) {
    return '1、'
  } else if (num == 2) {
    return '2、'
  } else if (num == 3) {
    return '3、'
  } else if (num == 4) {
    return '4、'
  } else if (num == 5) {
    return '5、'
  } else if (num == 6) {
    return '6、'
  } else if (num == 7) {
    return '7、'
  } else if (num == 8) {
    return '8、'
  } else if (num == 9) {
    return '9、'
  } else {
    return '* '
  }
}