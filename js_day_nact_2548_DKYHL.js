/*
http://wap.js.10086.cn/nact/resource/2548/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_打卡赢好礼
cron:25 40 10 5-10 * *
*/
const Env = require('./function/Env')
const { getMobileCK } = require('./app/appLogin')
const { nactFunc, getNactParams } = require('./app/appNact')

const $ = new Env('江苏移动_打卡赢好礼')
const actCode = '2548'

const js10086 = require('./app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})

!(async () => {
  $.message = ''
  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])
    
    $.message += `<font size="5">${$.phone}</font>\n`
    // console.log(`env: ${$.phone}, ${bodyParam}`)
    if (!$.phone || !bodyParam) {
      $.message += `登陆参数配置不正确\n`
      continue
    }

    console.log(`${$.phone}获取Cookie：`)
    $.setCookie = await getMobileCK($.phone, bodyParam)
    
    $.isLog = true
    $.isDirectReturnResultObj = true
    await initIndexPage()
    await initIndexPage()

    console.log()
    $.message += `\n`
    await $.wait(10000)
  }

  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

/**
 * 初始化页面
 */
async function initIndexPage() {
  let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'), true)
  if (!resultObj) {
    return
  }

  // 是否已打卡
  const isPunch = resultObj.isPunch
  if (!isPunch && resultObj.signDays < 6) {
    await rightAwayPunch()
  } else if (resultObj.awardName) {
    console.log(`今日打卡成功，获取${resultObj.awardName}`)
    $.message += `今日打卡成功，获取${resultObj.awardName}\n`
    // if (resultObj.signDays === 5) {
    //   await initIndexPage()
    // }
  } else if (resultObj.signDays === 6) {
    console.log(`本月已全部打卡`)
    $.message += `本月已全部打卡\n`
  } else {
    onsole.log(`今日已打卡`)
    $.message += `今日已打卡\n`
  }
  // const isContinuousPunch = resultObj.isContinuousPunch
  const conPchAndNotDrawn = resultObj.conPchAndNotDrawn
  if (conPchAndNotDrawn) {
    console.log(`已连续打卡，可进行超级抽奖`)
    await doSuperLottery()
  }
}


/**
 * 检查打卡
 */
async function rightAwayPunch() {
  const ret = await nactFunc($, getNactParams(actCode, 'rightAwayPunch'))

  if (!ret) {
    return
  }

  console.log(`打卡成功`)
  await $.wait(5000)

  // await initIndexPage()
}


/**
 * 超级抽奖
 */
async function doSuperLottery() {
  const ret = await nactFunc($, getNactParams(actCode, 'isContinuousPunch'))
  
  if (!ret) {
    return
  }

  console.log(`超级抽奖成功，获得奖励：${ret.awardName}`)
  $.message += `超级抽奖成功，获得奖励：${ret.awardName}\n`

  await $.wait(2000)
}