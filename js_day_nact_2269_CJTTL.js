/*
https://wap.js.10086.cn/nact/resource/2269/html/index.html?rm=ydc
江苏移动_抽奖天天乐
cron:40 0 9 * * *
*/
const Env = require('./function/Env')
const { options, getMobieCK } = require('./app/appLogin')
const { nactFunc } = require('./app/appNact')

const $ = new Env('江苏移动_抽奖天天乐')

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
    
    console.log(`${$.phone}获取活动信息......`)
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
      $.message += `积分数量不足150，无法抽奖...\n`
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
      $.message += `${doLottery.awardName}\n`
      console.log(`${doLottery.awardName}\n`)
    }

    console.log()
    $.message += `\n\n`

    await $.wait(8000)
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})