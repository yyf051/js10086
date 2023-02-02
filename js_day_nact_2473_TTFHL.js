/*
江苏移动_天天翻好礼
cron:40 50 9 1-3 * *
*/
const Env = require('./function/01Env')
const { options, getMobieCK } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_天天翻好礼')

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