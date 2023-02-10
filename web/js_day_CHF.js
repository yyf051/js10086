/*
江苏移动_查话费
cron:0 10 8-22 * * *
*/
const Env = require('../function/01Env')
const sendWX = require('../function/lcwx')
const { initCookie } = require('./webLogin')
const WebApi = require('./webApi')
const $ = new Env('江苏移动_查话费')
const webApi = new WebApi($)

const js10086 = require('./js10086_chf')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})

const noticeConfig = JSON.parse(process.env.WX_NOTICE_CONFIG || {})
const hours = (new Date()).getHours()

!(async () => {
  $.msg = ''
  for (let i = 0; i < cookiesArr.length; i++) {
    $.singleMessage = ''

    const cookie = cookiesArr[i]
    const success = await login(cookie)
    if (!success) {
      continue
    }

    await doActivity()
    console.log('------------------------------------------------\n\n\n')

    await $.wait(10000)
  }

  $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

async function doActivity() {
  const indexBar = await webApi.queryIndexTopBar()
  const tips = webApi.combineIndexBarMessage(indexBar)
  $.singleMessage += tips
  $.msg += `${tips}\n`

  const billInfo = await webApi.queryBillInfo()
  const tips2 = webApi.combineBillInfoMessage(billInfo)
  $.singleMessage += tips2
  $.msg += `${tips2}\n`

  const wxid = noticeConfig[$.phone]
  if ((hours === 8 || hours === 18) && $.singleMessage.length > 0) {
    sendWX(`尊敬的${$.phone}用户，您的套餐详情如下：\n${$.singleMessage}`, [wxid]) 
  }
}

// login
async function login(cookie) {
  $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
  $.password = cookie.match(/passwd=([^; ]+)(?=;?)/) && cookie.match(/passwd=([^; ]+)(?=;?)/)[1]
  $.wxid = noticeConfig[$.phone]
  $.msg += `<font size="5">${$.phone}</font>: \n`

  const ck = await initCookie($.phone, $.password)
  if (!ck) {
    $.msg += `登录失败，结束当前账号运行......\n`
    console.log(`登录失败，结束当前账号运行......`)
    return false
  }
  $.setCookie = ck
  return true
}