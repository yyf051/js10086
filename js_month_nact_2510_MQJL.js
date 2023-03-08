/*
江苏移动_满签奖励
cron:25 55 7 2,3 * *
*/
const Env = require('./common/Env')
const { getMobileCK } = require('./app/appLogin')
const { nactFunc } = require('./app/appNact')

const $ = new Env('江苏移动_满签奖励')

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
    $.setCookie = await getMobileCK($.phone, bodyParam)
    
    await doGetAllPrize()

    await $.wait(10000)
    console.log()
    $.message += `\n`
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch(async (e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  await $.sendNotify($.name, "签到失败，手动检查...")
}).finally(() => {
  $.done()
})

/**
 * 查询全部奖励
 */
async function doGetAllPrize () {
  await $.wait(2000)
  console.log(`${$.phone}获取签到信息......`)
  
  const params = `reqUrl=act2510&method=doGetAllPrize&operType=1&actCode=2510&type=1&extendParams=logType%3D1&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  // console.log('签到信息', JSON.stringify(resultObj))

  if (resultObj && resultObj.hasNotReceiveFullSign) {
      // 存在未领取的满签奖励，从logAllPrizeList中查找type=5的lotteryCode
      const wins = resultObj.logAllPrizeList.filter(e => e.type == 5)
      for (let i = wins.length - 1; i >= 0; i--) {
        const lotteryCode = wins[i].lotteryCode
        await doReceiveFullSign(lotteryCode)
      }
  } else {
    console.log(`${$.phone}无需领奖`)
    $.message += ` 满签奖励无需领奖\n`
  }
  return false
}

/**
 * 签到
 */
async function doReceiveFullSign (lotteryCode) {
  await $.wait(2000)
  console.log(`${$.phone}开始签到......`)

  const params = `reqUrl=act2510&method=doReceiveFullSign&operType=1&actCode=2510&lotteryCode=${lotteryCode}&extendParams=logType%3D1&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  if (!resultObj) {
    return false
  }
  // 成功签到，需要根据返回结果决定是否需要继续调用
  const receiveFullPrize = resultObj.receiveFullPrize
  if (receiveFullPrize && receiveFullPrize.awardNum) {
    // 直接下发奖励
    console.log(`${$.phone}签到成功，奖励: ${receiveFullPrize.awardName}`)
    $.message += `签到成功，奖励: ${receiveFullPrize.awardName}\n`
  } else {
    console.log(`${$.phone}领取失败`)
    $.message += ` 满签奖励领取失败\n`
  }
}
