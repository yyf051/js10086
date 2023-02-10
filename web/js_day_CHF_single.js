/*
江苏移动_查话费
cron:12 12 29 2 ?
*/
const Env = require('../function/01Env')
const sendWX = require('../function/lcwx')
const { initCookie } = require('./webLogin')
const { getOptions, getData } = require('./webApiUtils')
const BrowserFinger = require('./BrowserFinger')

const $ = new Env('江苏移动_查话费_机器人版')

const js10086 = require('./js10086_chf')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})


!(async () => {

  await doActivity()
  console.log('------------------------------------------------\n\n\n')

  $.sendNotify($.name, $.msg)

})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

async function doActivity() {
  $.msg = ''
  $.singleMessage = ''

  // 登陆
  await login()

  // 流量剩余
  const indexBar = await webApi.queryIndexTopBar()
  const tips = webApi.combineIndexBarMessage(indexBar)
  $.singleMessage += tips
  $.msg += `${tips}\n`

  // 账单信息
  const billInfo = await webApi.queryBillInfo()
  const tips2 = webApi.combineBillInfoMessage(billInfo)
  $.singleMessage += tips2
  $.msg += `${tips2}\n`

  sendWX(`尊敬的${$.phone}用户，您的套餐详情如下：\n${$.singleMessage}`, [JS_WX_ID]) 
}

async function login() {
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
    throw Error('账号或密码为空')
  }

  $.msg += `<font size="5">${$.phone}</font>: \n`
  const ck = await initCookie($)
  if (!ck) {
    throw Error('登录失败')
  }
  $.setCookie = ck
}
