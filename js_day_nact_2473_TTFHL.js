/*
江苏移动_天天翻好礼
cron:40 50 9 5-9 * *
*/
const Env = require('./01Env')
const { options, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

const $ = new Env('江苏移动_天天翻好礼')
!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
  // for (let i = 0; i < 1; i++) {
    await initCookie($, i)

    // $.isLog = true
    console.log(`${$.phone}获取活动信息......`)
    const params = 'reqUrl=act2473&method=initIndexPage&operType=1&actCode=2473&extendParams=&ywcheckcode=&mywaytoopen='
    const initRet = await nactFunc($, params)
    console.log(`获取活动信息：`, JSON.stringify(initRet))
    if (!initRet) {
      continue
    } else if (!initRet.paramId) {
      console.log(`没有paramId，不执行`)
      $.msg += `没有paramId，不执行\n`
      continue
      // initRet.paramId = 'dfcfbc4e279c297029f4ac944bf057d4b4872f25a01d7876'
    }

    if (initRet.haveChance > 0) {
      await doLottery(initRet.paramId)
      continue
    }

    const params2 = `reqUrl=act2473&method=initIndexPage&operType=1&actCode=2473&paramId=${initRet.paramId}&extendParams=paramId%3D${initRet.paramId}&ywcheckcode=&mywaytoopen=`
    const initRet2 = await nactFunc($, params2)
    console.log(`获取活动信息2：`, JSON.stringify(initRet2))
    if (!initRet2) {
      continue
    }
    if (initRet2.haveChance > 0) {
      await doLottery(initRet2.paramId)
    }
    
    console.log()
    $.msg += `\n\n`
    await $.wait(3000)
  }

  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})


async function doLottery(paramId) {
  await $.wait(2000)
  const params = `reqUrl=act2473&method=doLottery&operType=1&actCode=2473&extendParams=paramId%3D${paramId}&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  } else if (!ret.isWin) {
    console.log(`抽奖成功，未获得奖励`)
    $.msg += `抽奖成功，未获得奖励\n`
  } else {
    console.log(`抽奖成功，获得奖励：${ret.awardName}`)
    $.msg += `抽奖成功，获得奖励：${ret.awardName}\n`
  }

  await $.wait(2000)
}