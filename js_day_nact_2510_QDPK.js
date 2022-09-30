/*
江苏移动_签到PK
cron:25 20 10 * * *
*/
const Env = require('./01Env')
const { options, encryptedPhone, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

const $ = new Env('江苏移动_签到PK')

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    $.index = i
    await initCookie($, i)

    await initIndexFunny()

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
 * 签到PK
 */
async function initIndexFunny() {
  await $.wait(2000)
  const params = 'reqUrl=act2510&method=initIndexFunny&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen='
  const resultObj = await nactFunc($, params)
  if (resultObj) {

    // 进行PK
    if (!resultObj.pkIsPkToday) {
      $.msg += '尚未PK，进行PK~\n'
      console.log(`${$.phone}尚未PK，进行PK~`)
      await pkSign()
    } else if (resultObj.pkTodayInfo.status == 1) {
      $.msg += '今日已PK，PK胜利，赢得18E豆~\n'
      console.log(`${$.phone}今日已PK，PK胜利，赢得18E豆~`)
    } else if (resultObj.pkTodayInfo.status == 2) {
      $.msg += '今日已PK，PK平局~\n'
      console.log(`${$.phone}今日已PK，PK平局~`)
    } else if (resultObj.pkTodayInfo.status == 3) {
      $.msg += '今日已PK，PK失败~\n'
      console.log(`${$.phone}今日已PK，PK失败~`)
    }
  }
}

/**
 * PK
 */
async function pkSign() {
  await $.wait(2000)
  const params = `reqUrl=act2510&method=pkDoPk&operType=1&actCode=2510&type=0&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  if (resultObj.pkTodayInfo.status == 1) {
    $.msg += `PK成功，赢得18E豆~\n`
    console.log(`${$.phone} PK成功，赢得18E豆~`)
  } else if (resultObj.pkTodayInfo.status == 2) {
    $.msg += `PK平局\n`
    console.log(`${$.phone} PK平局~`)
  } else if (resultObj.pkTodayInfo.status == 3) {
    $.msg += `PK失败~\n`
    console.log(`${$.phone} PK失败~`)
  } else {
    $.msg += `结果未知，看数据~${JSON.stringify(resultObj)}\n`
    console.log(`${$.phone}结果未知，看数据~${resultObj}`)
  }
}