/*
http://wap.js.10086.cn/rec/iGKs?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_砸金蛋
cron:45 15 9 5 * *
*/
const Env = require('./function/01Env')
const { getMobieCK } = require('./function/01js10086_common')
const { mbactFunc } = require('./function/01js10086_mbnact')

const $ = new Env('江苏移动_砸金蛋')
const actNum = '700002839'

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
    
    console.log(`${$.phone}获取活动资格......`)
    const initRet0 = await mbactFunc($, 'entitle/preconditions', actNum)
    if (!initRet0) {
      $.msg += `获取活动资格失败\n`
      console.log(`获取活动资格失败`, initRet0)
      continue
    }


    console.log(`${$.phone}查询可抽奖次数......`)
    const initRet = await mbactFunc($, 'checkEntitleAccount', actNum)
    if (!initRet) {
      $.msg += `查询可抽奖次数失败\n`
      console.log(`查询可抽奖次数失败`, initRet)
      continue
    }
    if (initRet.surplusCount > 0) {
      for (let j = 0; j < initRet.surplusCount; j++) {
        const checkCanLottery = await mbactFunc($, 'checkCanLottery', actNum)
        if (!checkCanLottery) {
          $.msg += `无抽奖权限\n`
          console.log(`无抽奖权限`, checkCanLottery)
          continue
        }
        await $.wait(1000)

        const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', `${actNum}&sourcesNum=H5&featureCode=`)
        if (!lotteryStrengthen) {
          $.msg += `抽奖失败\n`
          console.log(`抽奖失败`, lotteryStrengthen)
          continue
        }
        $.msg += `赢得${lotteryStrengthen.prize_name}\n`
        console.log(`赢得${lotteryStrengthen.prize_name}\n`)
        await $.wait(2000)
      }
    } else {
      $.msg += `本月已参与过，无抽奖机会了\n`
      console.log(`本月已参与过，无抽奖机会了`)
    }
    
    console.log()
    $.msg += `\n`
    await $.wait(10000)
  }
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})