/*
https://wap.js.10086.cn/nact/resource/2269/html/index.html?rm=ydc
江苏移动_抽奖天天乐
cron:40 0 9 * * *
*/
const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_抽奖天天乐')
!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    console.log(`${$.accountName}获取活动信息......`)

    let params = {
      "reqUrl": "act2269",
      "method": "initIndexPage",
      "actCode": "2269",
      "extendParams": "",
      "ywcheckcode": "",
      "mywaytoopen": ""
    }
    const initIndexPage = await nactFunc($, params)
    if (!initIndexPage) {
      continue
    }
    await $.wait(3000)
    
    params = {
      "reqUrl": "act2269",
      "method": "sureAgain",
      "actCode": "2269",
      "extendParams": "",
      "ywcheckcode": "",
      "mywaytoopen": "",
      "operType": "3",
      "type": "1",
    }
    const sureAgain = await nactFunc($, params)
    if (!sureAgain) {
      continue
    } else if (sureAgain.score < 150) {
      /*{
        "result": "-2236014",
        "isLogin": true,
        "score": 136,
        "cmtonkendId": "mobileCookie=B3D581A27DCC453A95BCC414F678BF30@js.ac.10086.cn&loginType=",
        "userMobile": "152****0683",
        "isApp": true
      }*/
      $.msg += `积分数量不足150，无法抽奖...\n`
      console.log(`积分数量不足150，无法抽奖...\n`)
      continue;
    }
    await $.wait(3000)

    params = {
      "reqUrl": "act2269",
      "method": "doLottery",
      "actCode": "2269",
      "extendParams": "",
      "ywcheckcode": "",
      "mywaytoopen": "",
      "operType": "3",
      "type": "1",
    }
    const doLottery = await nactFunc($, params)
    if (!doLottery) {
      continue
    }

    if (doLottery.isApp) {
      $.msg += `${doLottery.awardName}\n`
      console.log(`${doLottery.awardName}\n`)
    }

    console.log()
    $.msg += `\n\n`

    await $.wait(8000)
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})