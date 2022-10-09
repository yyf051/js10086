/*
江苏移动_满签奖励
cron:25 55 7 * * *
*/
const Env = require('./01Env')
const { options, encryptedPhone, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

const $ = new Env('江苏移动_满签奖励')

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    $.index = i
    await initCookie($, i)
    await doGetAllPrize()

    await $.wait(10000)
    console.log()
    $.msg += `\n`
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
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
    $.msg += ` 满签奖励无需领奖\n`
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
    $.msg += `签到成功，奖励: ${receiveFullPrize.awardName}\n`
  } else {
    console.log(`${$.phone}领取失败`)
    $.msg += ` 满签奖励领取失败\n`
  }
}
