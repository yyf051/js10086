/*
江苏移动_日统计
cron:12 12 29 2 ?
*/
const Env = require('./function/01Env')
const { initCookie } = require('./function/01js10086_common2')
const BrowserFinger = require('./function/BrowserFinger')
const sendWX = require('./function/lcwx')

const $ = new Env('江苏移动_日统计')

const js10086 = require('./function/js10086_chf')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})
const noticeConfig = JSON.parse(process.env.WX_NOTICE_CONFIG || {})


!(async () => {
  $.msg = ''
  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    $.password = cookie.match(/passwd=([^; ]+)(?=;?)/) && cookie.match(/passwd=([^; ]+)(?=;?)/)[1]
    $.wxid = noticeConfig[$.phone]

    const ck = await initCookie($)
    if (!ck) {
      $.msg += `${$.phone}登录失败......\n\n`
      continue
    }
    $.setCookie = ck

    $.msg += `<font size="5">${$.phone}</font>: \n`
    
    await doActivity()

    await $.wait(10000)
  }

  $.sendNotify($.name, $.msg)

})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

async function doActivity() {
  
  const m1 = await initLLCZJL()
  sendWX(m1, [$.wxid])
}

/*
{
  "success": "0",
  "message": null,
  "code": "0",
  "data": {
    "lists": [{
      "id": 0,
      "yearMm": "2023年2月",
      "flowPaySeqInfos": [{
        "inServNumber": "13813753702",
        "inUserName": "吴金帅",
        "outServNumber": "",
        "outUserName": "",
        "inCome": "1",
        "flowValue": "602112",
        "dealDate": "20230201085122",
        "reMark": "",
        "accesstype": "19",
        "reason": "国内通用流量（套外）随机"
    }]
  },
  "logicCode": null,
  "systemCode": null,
  "timestamp": 1675836959402,
  "retcode": null,
  "retmsg": null
}
*/
async function initLLCZJL() {
  const op = getOptions($.setCookie, $.phone, 'LLCZJL', 'LLCZJL', 'initLLCZJL-init', 'LLCZJL/initLLCZJL')
  const func = new Promise(resolve => {
    $.post(op, (err, resp, data) => {
      if (err) throw Error(err)

      data = JSON.parse(data)
      resolve(data)
    })
  })
  const result = await func()
  if (data.success != '0' || data.code != '0') {
    console.log(`查询失败，状态不对${data.success}, ${data.code}`)
    return
  }
  const flowPaySeqInfos = data.data.lists[0].flowPaySeqInfos
  const yearMm = data.data.lists[0].yearMm

  combineLLJL(yearMm, flowPaySeqInfos)

}
function combineLLJL(yearMm, flowPaySeqInfos) {
  
  // 按天分组
  const dayGroup = flowPaySeqInfos.reduce((group, element) => {
    const key = element.dealDate.substring(0, 8)
    group[key] = group[key] || []
    group[key].push(element)

    return group
  }, {})
  // console.log(JSON.stringify(dayGroup))

  // 按天合计
  const daySum = {}
  let monthSum = 0
  for(const els in dayGroup) {
    const dayTotal = dayGroup[els].reduce((total, element) => {
      total += element.flowValue - 0
      return total
    }, 0)
    const m = dayTotal / 1024
    const t = m >= 1024 ? (m / 1024).toFixed(2) + 'G' : m + 'M'

    const k = els.substring(0, 4) + '/' + els.substring(4, 6) + '/' + els.substring(6, 8)
    daySum[k] = t

    monthSum += dayTotal
  }
  monthSum = (monthSum / 1024) >= 1024 ? (monthSum / 1024 / 1024).toFixed(2) + 'G' : (monthSum / 1024) + 'M'
  console.log(JSON.stringify(daySum))
  console.log(monthSum)

  Object.keys(daySum).
  return `今日获取流量总数：${daySum}\n本月获取流量总数：${monthSum}`
}

function getOptions(ck, phone, bizCode, pageCode, subBizCode, apiName) {
  const options = {
    url: `https://wap.js.10086.cn/vw/gateway/biz/${apiName}`,
    headers: getHeaders(ck),
    body: JSON.stringify(getData(phone, bizCode, pageCode, subBizCode))
  }

}

function getHeaders(ck) {
  return { 
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
    'Cookie': ck
  }
}

function getData(phone, bizCode, pageCode, subBizCode) {
  const date = new Date()
  const mobile = BrowserFinger.encryptByDES(phone)
  pageCode = pageCode || bizCode
  return {
    "wapContext": {
      "channel": "",
      "netType": "",
      "optType": "3",
      "bizCode": bizCode,
      "pageCode": pageCode,
      "markCdeo": `${mobile}-${pageCode}-${bizCode}-${date.getTime()}`,
      "subBizCode": subBizCode || "",
      "effect": "",
      "verifyCode": ""
    }
  }
}