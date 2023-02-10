const Env = require('./function/Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_积分答题挑战赛')
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
  const params = `reqUrl=act2533&method=initIndexPage&operType=0&actCode=2533&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  const black = ret.Black
  if (black == 0) {
    console.log(`存在抽奖${surplusChance}机会，进行抽奖`)
    $.message += `存在抽奖${surplusChance}机会，进行抽奖\n`
    for (let i = 0; i < surplusChance; i++) {
      await doLottery()
    }
  } else {
    console.log(`黑名单用户~`)
    $.message += `黑名单用户~\n`
    return
  }

  await $.wait(2000)

  await confirm()
}


async function confirm() {
  const params = `reqUrl=act2533&method=confirm&operType=0&actCode=2533&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  } else if (ret.isblack != 1) {
    console.log(`黑名单用户2~`)
    $.message += `黑名单用户2~\n`
    return
  }

  await $.wait(2000)

  await integralDeduction()
}


async function integralDeduction() {
  const params = `reqUrl=act2533&method=integralDeduction&operType=0&actCode=2533&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  await $.wait(2000)

  await extractSubject()
}


async function extractSubject() {
  const params = `reqUrl=act2533&method=extractSubject&operType=0&actCode=2533&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  } else if (ret.Black != 0) {
    console.log(`黑名单用户3~`)
    $.message += `黑名单用户3~\n`
    return
  }

  await $.wait(2000)

  await checkAnswer(ret.subject.fid)
}


async function checkAnswer(fid) {
  const params = `reqUrl=act2533&method=checkAnswer&operType=0&fid=${fid}&answer=A&actCode=2533&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`抽奖成功，获得奖励：${ret.AwardName}`)
  $.message += `抽奖成功，获得奖励：${ret.AwardName}\n`
}
