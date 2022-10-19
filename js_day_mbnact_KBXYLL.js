/*
江苏移动_开宝箱赢流量
cron:0 30 8 * * *
*/
const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { mbactFunc } = require('./function/01js10086_mbnact')

const $ = new Env('江苏移动_开宝箱赢流量')
!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    console.log(`${$.accountName}获取活动信息......`)
    const initRet = await mbactFunc($, 'checkEntitleAccount', '700002203')
    if (!initRet) {
      continue
    }
    if (initRet.surplusCount > 0) {
      for (let j = 0; j < initRet.surplusCount; j++) {
        const checkCanLottery = await mbactFunc($, 'checkCanLottery', '700002203')
        if (!checkCanLottery) {
          continue
        }
        await $.wait(1000)

        const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', '700002203&sourcesNum=H5&featureCode=')
        if (!lotteryStrengthen) {
          continue
        }
        $.msg += `赢得${lotteryStrengthen.prize_name}\n`
        console.log(`赢得${lotteryStrengthen.prize_name}\n`)
        await $.wait(2000)
      }
    } else {
      $.msg += `本月已参与过，无抽奖机会了\n`
      console.log(`本月已参与过，无抽奖机会了\n`)
    }
    
    console.log()
    $.msg += `\n`
    await $.wait(10000)
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})