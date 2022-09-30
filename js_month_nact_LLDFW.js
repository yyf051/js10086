const Env = require('./01Env')
const $ = new Env('江苏移动_流量大富翁')

const { options, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)
    await doActivity()
    
    console.log()
    $.msg += `\n\n`
    await $.wait(5000)
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})


/*{
  "userMobile": "152****0683",
  "isApp": true,
  "loginStatus": "1",
  "stock": 41038,
  "yzmStatus": false
}
{
  "userMobile": "152****0683",
  "errorCode": "-2335006",
  "isApp": true,
  "loginStatus": "1",
  "openLog": {
    "fAreaNum": "20",
    "fCh": "0321",
    "fChance": "1",
    "fChannel": "isapp",
    "fExpand1": "0",
    "fIsOpen": "1",
    "fMobile": "15251300683",
    "fTime": "20220311165028742"
  }
}*/
async function doActivity () {
  console.log(`${$.accountName}获取活动信息......`)
  const params = {
    "reqUrl": "act2335",
    "method": "initIndexPage",
    "actCode": "2335",
    "extendParams": "",
    "ywcheckcode": "",
    "mywaytoopen": ""
  }
  const resultObj = await nactFunc($, params)
  if (!resultObj) {
    // $.msg += `未查询到活动信息...`
    return
  }
  let ret = -1
  if (resultObj.errorCode && resultObj.openLog) {
    if (resultObj.openLog.fChance > 0) {
      message = `已领取机会，还剩余${resultObj.openLog.fChance}次抽奖;`
      ret = resultObj.openLog.fChance
    } else {
      message = `没有抽奖机会了~~`
    }
  } else if (resultObj.stock > 2) {
    message = `可以参与领奖；`
    ret = 0
  } else {
    message = `标记位=${ret}，没有机会了;`
  }
  $.msg += message + '\n'
  console.log(`${$.accountName} ${message}`)

  if (ret == 0) {
    const openBusinessResult = await openBusiness()
    await $.wait(2000)
    if (openBusinessResult) {
      const f = await doLottery()
      if (f) {
        await $.wait(2000)
        await doLottery()
      }
    }
  } else if (ret < 0) {
    // console.log(`标记位=${ret}，没有机会了\n`)
  } else {
    for (let i = 0; i < ret; i++) {
      await doLottery()
    }
  }
}

/*{
  "addSucess": "addSucess",
  "userMobile": "152****0683",
  "isApp": true,
  "loginStatus": "1"
}*/
async function openBusiness () {
  const params = {
    "reqUrl": "act2335",
    "method": "openBusiness",
    "operType": "1",
    "actCode": "2335",
    "fxmobile": "",
    "smsCode": "0",
    "extendParams": "ch%3D0321",
    "ywcheckcode": "",
    "mywaytoopen": ""
  }
  const resultObj = await nactFunc($, params)
  const r = resultObj.addSucess == 'addSucess'
  if (r) {
    $.msg += `抽奖机会领取成功，进行抽奖......\n`
    console.log(`抽奖机会领取成功，进行抽奖......\n`)
  } else {
    $.msg += `抽奖机会领取失败......，抽奖结果如下：${JSON.stringify(resultObj)}\n`
    console.log(`抽奖机会领取失败......，抽奖结果如下：${JSON.stringify(resultObj)}\n`)
  }
  return r
}

/*{
  "userMobile": "152****0683",
  "leftChance": 1,
  "awardCode": "GIFT_LL_2335_001_1888",
  "isApp": true,
  "loginStatus": "1",
  "awardName": "1888MB通用流量",
  "flow": "7971",
  "isWin": true
}*/
async function doLottery () {
  const params = {
    "reqUrl": "act2335",
    "method": "doLottery",
    "operType": "1",
    "actCode": "2335",
    "extendParams": "ch%3D0321",
    "ywcheckcode": "",
    "mywaytoopen": ""
  }
  const resultObj = await nactFunc($, params)
    
  let ret = false
  if (resultObj.isApp) {
    $.msg += `${resultObj.awardName}\n`
    console.log(`${resultObj.awardName}\n`)
    ret = resultObj.leftChance > 0
  }
  return ret
}
