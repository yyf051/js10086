const Env = require('./01Env')
const { ua, options, initCookie } = require('./01js10086_common')
const { mbactFunc } = require('./01js10086_mbnact')

const $ = new Env('江苏移动_砸金蛋')
const actNum = '700002839'
!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    console.log(`${$.accountName}获取活动信息......`)
    const initRet = await mbactFunc($, 'checkEntitleAccount', actNum)
    if (!initRet) {
      $.msg += `活动查询失败\n`
      console.log(`活动查询失败`, initRet)
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