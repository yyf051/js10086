/*
http://wap.js.10086.cn/nact/resource/2548/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_打卡赢好礼
cron:25 40 10 * * *
*/
const Env = require('./function/01Env')
const { getMobieCK } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_打卡赢好礼')
const actCode = '2548'

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
    
    // $.isLog = true
    await initIndexPage()
    
    console.log()
    $.msg += `\n`
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
 * 初始化页面
 */
async function initIndexPage() {
  const params = `reqUrl=act${actCode}&method=initIndexPage&operType=1&actCode=${actCode}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  // 是否已打卡
  const isPunch = ret.isPunch
  if (!isPunch) {
    await rightAwayPunch()
  } else if (ret.awardName) {
    console.log(`打卡成功，获取${ret.awardName}`)
  $.msg += `打卡成功，获取${ret.awardName}\n`
  } else {
    console.log(`今日已打卡`)
  }

  // TODO 打卡6天超级抽奖
}


/**
 * 检查打卡
 */
async function rightAwayPunch() {
  const params = `reqUrl=act${actCode}&method=rightAwayPunch&operType=1&actCode=${actCode}&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  console.log(`打卡成功`)
  await $.wait(5000)

  await initIndexPage()
}


/**
 * 超级抽奖
 */
async function doSuperLottery() {
  const params = `reqUrl=act${actCode}&method=doSuperLottery&operType=1&actCode=${actCode}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`超级抽奖成功，获得奖励：${ret.awardName}`)
  $.msg += `超级抽奖成功，获得奖励：${ret.awardName}\n`

  await $.wait(2000)
}