/*
http://wap.js.10086.cn/nact/resource/xxxx/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_xxxx
cron:25 43 10 5 * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./function/01js10086_common')
const { nactFunc, getNactParams } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_xxx')
const actCode = 'xxxx'

const js10086 = require('./function/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})

!(async () => {
  $.msg = ''
  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])
    
    $.msg += `<font size="5">${$.phone}</font>\n`
    // console.log(`env: ${$.phone}, ${bodyParam}`)
    if (!$.phone || !bodyParam) {
      $.msg += `登陆参数配置不正确\n`
      continue
    }

    console.log(`${$.phone}获取Cookie：`)
    $.setCookie = await getMobieCK($.phone, bodyParam)

    await execActivity()
    
    console.log()
    $.msg += `\n`
    console.log(`---------------------------------------------------------\n`)
    await $.wait(10000)
  }

  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

/**
 * 开始处理
 */
async function execActivity() {    
  $.isLog = false
  $.isDirectReturnResultObj = true
  let resultObj = await initIndexPage()
  
  // speical logic

}

/**
 * 初始化页面
 */
async function initIndexPage() {
  let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'), true)
  if (!resultObj) {
    throw Error('初始化活动失败...')
  }
  return resultObj
}

/**
 * 抽奖
 */
async function doLottery(taskId) {
  // const params = `reqUrl=act${actCode}&method=doLottery&operType=1&actCode=${actCode}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const params = getNactParams(actCode, 'doLottery')
  params.taskId = taskId
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`抽奖成功，获得奖励：${ret.prizeLog}`)
  $.msg += `抽奖成功，获得奖励：${ret.prizeLog}\n`

  await $.wait(2000)
}
