/*
江苏移动_签到PK
cron:25 20 10 * * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const { nactFunc } = require('./app/appNact')

const $ = new Env('江苏移动_签到PK')

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
    
    await initIndexFunny()

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
 * 签到PK
 */
async function initIndexFunny() {
  await $.wait(2000)
  const params = 'reqUrl=act2510&method=initIndexFunny&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen='
  const resultObj = await nactFunc($, params)
  if (resultObj) {

    // 进行PK
    if (!resultObj.pkIsPkToday) {
      $.message += '尚未PK，进行PK~\n'
      console.log(`${$.phone}尚未PK，进行PK~`)
      await pkSign()
    } else if (resultObj.pkTodayInfo.status == 1) {
      $.message += '今日已PK，PK胜利，赢得18E豆~\n'
      console.log(`${$.phone}今日已PK，PK胜利，赢得18E豆~`)
    } else if (resultObj.pkTodayInfo.status == 2) {
      $.message += '今日已PK，PK平局~\n'
      console.log(`${$.phone}今日已PK，PK平局~`)
    } else if (resultObj.pkTodayInfo.status == 3) {
      $.message += '今日已PK，PK失败~\n'
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
    $.message += `PK成功，赢得18E豆~\n`
    console.log(`${$.phone} PK成功，赢得18E豆~`)
  } else if (resultObj.pkTodayInfo.status == 2) {
    $.message += `PK平局\n`
    console.log(`${$.phone} PK平局~`)
  } else if (resultObj.pkTodayInfo.status == 3) {
    $.message += `PK失败~\n`
    console.log(`${$.phone} PK失败~`)
  } else {
    $.message += `结果未知，看数据~${JSON.stringify(resultObj)}\n`
    console.log(`${$.phone}结果未知，看数据~${resultObj}`)
  }
}