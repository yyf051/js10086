const Env = require('./function/Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_加好友抽盲盒')
!(async () => {
  $.message = ''
  for (let i = 0; i < options.length; i++) {
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
  const params = `reqUrl=act2531&method=initIndexPage&operType=0&actCode=2531&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  const surplusChance = ret.surplusChance
  if (surplusChance && surplusChance > 0) {
    console.log(`存在抽奖${surplusChance}机会，进行抽奖`)
    $.message += `存在抽奖${surplusChance}机会，进行抽奖\n`
    for (let i = 0; i < surplusChance; i++) {
      await doLottery()
    }
  } else {
    console.log(`暂无抽奖机会~`)
    $.message += `暂无抽奖机会~\n`
    return
  }


  await $.wait(2000)
}


/**
 * 抽奖
 */
async function doLottery() {
  const params = `reqUrl=act2531&method=doLottery&operType=0&actCode=2531&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`抽奖成功，获得奖励：${ret.AwardName}`)
  $.message += `抽奖成功，获得奖励：${ret.AwardName}\n`

  await $.wait(2000)
}