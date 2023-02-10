const Env = require('./function/Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_虎虎生威，扭转乾坤')
!(async () => {
  $.message = ''
  for (let i = 0; i < options.length; i++) {
  // for (let i = 0; i < 1; i++) {
    await initCookie($, i)

    // $.isLog = true
    console.log($.phone)
    $.message += `<font size="5">${$.phone}</font>\n`
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
  $.isDirectReturnResultObj = true
  const params = `reqUrl=act2438&method=initIndexPage&operType=1&actCode=2438&extendParams=ch%3D01f7&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    console.log(`出错了，请查看日志`)
    $.message += `出错了，请查看日志\n`
    return
  }

  const chanceLeft = ret.chanceLeft
  if (chanceLeft > 0) {
    if (ret.errorCode == '-2438008') {
      // 未点击广告，则先执行
      await jumpAdvertis()
      for (var i = 0; i < chanceLeft; i++) {
        await doLottery()
      }
    } else if (ret.errorCode == '-2438009') {
      for (var i = 0; i < chanceLeft; i++) {
        await doLottery()
      }
    }
  } else {
    console.log(`今日已完成抽奖`)
    $.message += `今日已完成抽奖\n`
  }

  await $.wait(2000)
}

/**
 * 完成任务
 */
async function jumpAdvertis() {
  const params = `reqUrl=act2438&method=jumpAdvertis&operType=1&actCode=2438&extendParams=ch%3D01f7&ywcheckcode=&mywaytoopen=`
  await nactFunc($, params)

  await $.wait(2000)
}


/**
 * 抽奖
 */
async function doLottery() {
  const params = `reqUrl=act2438&method=doLottery&operType=1&actCode=2438&extendParams=ch%3D01f7&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    console.log(`抽奖失败`)
    $.message += `抽奖失败\n`
    return
  } else if (ret.errorCode == '-2438007') {
    console.log(`抽奖失败：${ret.errorMsg}`)
    $.message += `抽奖失败：${ret.errorMsg}\n`
  } else if (ret.isWin && ret.awardCode) {
    console.log(`抽奖成功：${ret.awardName}`)
    $.message += `抽奖成功：${ret.awardName}\n`
  }  else {
    console.log(`抽奖结果：${JSON.stringify(ret)}`)
    $.message += `抽奖结果：${JSON.stringify(ret)}\n`
  }

  await $.wait(2000)
}