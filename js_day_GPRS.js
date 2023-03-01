/*
江苏移动_日统计
cron:12 12 29 2 ?
*/
const Env = require('./function/Env')
const sendWX = require('./function/lcwx')
const { initCookie } = require('./web/webLogin')
const WebApi = require('./web/webApi')

const $ = new Env('江苏移动_日统计')
const webApi = new WebApi($)

const js10086 = require('./web/js10086_chf')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})
const noticeConfig = JSON.parse(process.env.WX_NOTICE_CONFIG || {})


!(async () => {
  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    const success = await login(cookie)
    if (!success) {
      continue
    }

    await doActivity()
    console.log('-------------------------------------------------\n\n')

    await $.wait(5000)
  }

  $.sendNotify($.name, $.message)

})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

function appendMsg(msg) {
  $.message = $.message || ''
  $.message += msg
}

async function login(cookie) {
  $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
  $.password = cookie.match(/passwd=([^; ]+)(?=;?)/) && cookie.match(/passwd=([^; ]+)(?=;?)/)[1]
  $.wxid = noticeConfig[$.phone]
  appendMsg(`<font size="5">${$.phone}</font>: \n`)

  const ck = await initCookie($.phone, $.password)
  if (!ck) {
    appendMsg(`登录失败，结束当前账号运行......\n\n`)
    return false
  }
  $.setCookie = ck
  return true
}

async function doActivity() {
  
  const m1 = await initLLCZJL()
  appendMsg(`${m1}\n\n`)
  console.log(`${$.phone}:\n${m1}`)
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
  const data = await webApi.initLLCZJL()
  if (data.success != '0' || data.code != '0') {
    console.log(`查询失败，状态不对${data.success}, ${data.code}`)
    return
  }
  const flowPaySeqInfos = data.data.lists[0].flowPaySeqInfos

  return combineLLJL(flowPaySeqInfos)

}
function combineLLJL(flowPaySeqInfos) {
  
  // 按天分组
  const dayGroup = flowPaySeqInfos.reduce((group, element) => {
    const key = element.dealDate.substring(0, 8)
    group[key] = group[key] || []
    group[key].push(element)

    return group
  }, {})

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

  const today = daySum[Object.keys(daySum).pop()]
  const yesterday = Object.keys(daySum).length >= 2 ? daySum[Object.keys(daySum).slice(-2)[0]] : '无'
  return `获取流量统计：\n今日获取流量总数：${today}\n昨日获取流量总数：${yesterday}\n本月获取流量总数：${monthSum}`
}
