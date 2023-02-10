/*
江苏移动_E豆小店
cron:40 30 9 * * *
*/
const Env = require('./function/Env')
const { options, getMobieCK } = require('./app/appLogin')
const { nactFunc } = require('./app/appNact')

const $ = new Env('江苏移动_E豆小店')

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
    $.setCookie = await getMobieCK($.phone, bodyParam)
    
    // $.isLog = true
    await initIndexPage()
    
    console.log()
    $.message += `\n\n`
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
  const params = `reqUrl=act2504&method=initIndexPage&operType=0&actCode=2504&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  await obtainVideo(ret.shipin)

  await turntable()
}

/**
 * 看视频的E豆
 */
async function obtainVideo(shipin) {

  const count = shipin || 0
  if (count < 5) {
    const left = 5 - count
    console.log(`看视频得E豆剩余次数：${left}`)
    $.message += `看视频得E豆剩余次数：${left}\n`
    for (let i = 0; i < left; i++) {

      const params = `reqUrl=act2504&method=obtainVideo&actCode=2504&extendParams=&ywcheckcode=&mywaytoopen=`
      await nactFunc($, params)
      console.log(`看视频${i+1} 已完成`)
      $.message += `看视频${i+1} 已完成\n`

      await $.wait(30000)
    }
  } else {
    console.log(`看视频得E豆 今日已完成`)
    $.message += `看视频得E豆 今日已完成\n`
    return
  }
}


/**
 * 执行E豆任务
 */
async function turntable() {
  await $.wait(2000)
  console.log(`${$.phone}E豆换抽奖......`)
  const params = `reqUrl=act2504&method=turntable&actCode=2504&extendParams=&ywcheckcode=&mywaytoopen=`
  const turnRet = await nactFunc($, params)
  if (!turnRet) {
    return
  } else if (turnRet.choujiangnum <= 0) {
    console.log(`今日已无抽奖机会`)
    $.message += `今日已无抽奖机会\n`
    return
  }

  // 可以抽3次，但没必要，只有第一次才有流量
  for (var i = 0; i < 1; i++) {
    await $.wait(2000)
    await doLottery()
  }
}


async function doLottery() {
  await $.wait(2000)
  const params = `reqUrl=act2504&method=doLottery&actCode=2504&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  } else if(ret.awardType == '1') {
    console.log(`抽奖成功，获得奖励：${ret.prizelog}`)
    $.message += `抽奖成功，获得奖励：${ret.prizelog}\n`
  } else if(ret.awardType == '11') {
    console.log(`抽奖成功，获得奖励：${ret.prizelog}`)
    $.message += `抽奖成功，获得奖励：${ret.prizelog}\n`
  } else {
    console.log(`抽奖结果：${JSON.stringify(ret)}`)
    $.message += `抽奖结果：${JSON.stringify(ret)}\n`
  }

  await $.wait(2000)
}