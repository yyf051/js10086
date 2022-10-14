/*
http://wap.js.10086.cn/nact/resource/2335/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_流量大富翁
cron:45 35 9 4-9 * *
*/
const Env = require('./01Env')
const $ = new Env('江苏移动_流量大富翁')

const { options, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)
    $.isLog = true
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
  "continue": true,
  "errorCode": "",
  "resultCode": "1",
  "resultCom": {
    "cityNo": "20",
    "ch": "01",
    "webmobile": "45463-55396-4875-25703",
    "appmobile": "FDA76A4EF6C1BC8628207F7A0C5F32B8",
    "mobile": "",
    "bdmobile": "32d607468"
  },
  "resultObj": {
    "userMobile": "136****7864",
    "isApp": true,
    "loginStatus": "1",
    "stock": 457591,
    "yzmStatus": false
  },
  "success": true
}*/
/*{
  "continue": true,
  "errorCode": "",
  "resultCode": "1",
  "resultCom": {
    "cityNo": "20",
    "ch": "0321",
    "webmobile": "1875-59138-5002-33078",
    "appmobile": "CB03BA4E2D1DF5CC2B69ABC3C9F51306",
    "mobile": "",
    "bdmobile": "3375d2766"
  },
  "resultMsg": "当日已开通业务",
  "resultObj": {
    "userMobile": "138****3702",
    "errorCode": "-2335006",
    "isApp": true,
    "loginStatus": "1",
    "openLog": {
      "fAreaNum": "20",
      "fCh": "0321",
      "fChance": "4",
      "fChannel": "isapp",
      "fExpand1": "0",
      "fIsOpen": "1",
      "fMobile": "13813753702",
      "fTime": "20221013151044027"
    }
  },
  "success": true
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
  let resultObj = await nactFunc($, params, true)
  if (!resultObj) {
    // $.msg += `未查询到活动信息...`
    return
  }
  if (resultObj.yzmStatus) {
    concatMsg('需要验证码登录，跳过...')
    return
  }

  let message
  if (resultObj.stock > 1) {
    message = `金币库存充足： ${resultObj.stock}  `
    concatMsg(message)
    await openBusiness()
    
    // 领取金币之后重新查询结果
    resultObj = await nactFunc($, params, true)
  }


  if (resultObj.errorCode && resultObj.openLog) {
    // 已领取过金币，进行抽奖
    if (resultObj.openLog.fChance > 0) {
      message = `已领取机会，还剩余${resultObj.openLog.fChance}次抽奖;`
      concatMsg(message)
      await doLottery()
    } else {
      message = `今日抽奖机会已用完，明天再来吧~~`
      concatMsg(message)
    }
  } else {
    message = `未查询到openLog，没有机会~~`
    concatMsg(message)
  }
}

/*{
  "continue": true,
  "errorCode": "",
  "resultCode": "1",
  "resultCom": {
    "cityNo": "20",
    "ch": "0321",
    "webmobile": "53655-43108-4885-25697",
    "appmobile": "FDA76A4EF6C1BC8628207F7A0C5F32B8",
    "mobile": "",
    "bdmobile": "32d607468"
  },
  "resultObj": {
    "addSucess": "addSucess",
    "userMobile": "136****7864",
    "loginStatus": "1"
  },
  "success": true
}*/
async function openBusiness () {
  await $.wait(5000)
  
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
  const resultObj = await nactFunc($, params, true)
  const r = resultObj.addSucess == 'addSucess'
  let message;
  if (r) {
    message = `抽奖机会领取成功，进行抽奖......`
  } else {
    message = `抽奖机会领取失败......，抽奖结果如下：${JSON.stringify(resultObj)}\n`
  }
  concatMsg(message)
  return r
}

/*{
  "continue": true,
  "errorCode": "",
  "resultCode": "1",
  "resultCom": {
    "cityNo": "20",
    "ch": "0321",
    "webmobile": "5971-30466-5023-33078",
    "appmobile": "CB03BA4E2D1DF5CC2B69ABC3C9F51306",
    "mobile": "",
    "bdmobile": "3375d2766"
  },
  "resultObj": {
    "userMobile": "138****3702",
    "leftChance": 3,
    "awardCode": "GIFT_LL_2335_001_random_01",
    "loginStatus": "1",
    "awardName": "642MB通用流量",
    "flow": "642",
    "isWin": true
  },
  "success": true
}*/

/*{
  "continue": true,
  "errorCode": "",
  "resultCode": "1",
  "resultCom": {
    "cityNo": "20",
    "ch": "0321",
    "webmobile": "53655-26724-5102-25703",
    "appmobile": "FDA76A4EF6C1BC8628207F7A0C5F32B8",
    "mobile": "",
    "bdmobile": "32d607468"
  },
  "resultMsg": "无抽奖机会",
  "resultObj": {
    "userMobile": "136****7864",
    "errorCode": "-2335010",
    "loginStatus": "1"
  },
  "success": true
}*/
async function doLottery () {

  await $.wait(6000)

  const params = {
    "reqUrl": "act2335",
    "method": "doLottery",
    "operType": "1",
    "actCode": "2335",
    "extendParams": "ch%3D0321",
    "ywcheckcode": "",
    "mywaytoopen": ""
  }
  const resultObj = await nactFunc($, params, true)
    
  let ret = false
  if (resultObj.isWin) {
    concatMsg(resultObj.awardName)
    ret = resultObj.leftChance > 0
  }
  if (ret) {
    await doLottery()
  }
}

function concatMsg(message) {
  $.msg += `${message}\n`
  console.log(message)
}