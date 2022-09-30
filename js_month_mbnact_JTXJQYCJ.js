/*
江苏移动_家庭星级权益抽奖
cron:45 45 8 5 * *
*/
const Env = require('./01Env')
const { options, initCookie } = require('./01js10086_common')
const { mbactFunc } = require('./01js10086_mbnact')

// https://wap.js.10086.cn/mb_nact/new/act-front/cj/cj016/main.html?actNum=700001296

const $ = new Env('江苏移动_家庭星级权益抽奖')
const actionNum = '700001296'

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
  // for (let i = 1; i < 2; i++) {
    await initCookie($, i)

    const preRet = await mbactFunc($, 'entitle/preconditions', actionNum)
    if (!preRet) {
      continue
    } else if (!preRet.qualified) {
      $.msg += `查无资格\n`
      console.log(`查无资格`)
    }

    console.log(`${$.phone}获取活动信息......`)
    const initRet = await mbactFunc($, 'checkEntitleAccount', actionNum)
    if (!initRet) {
      continue
    }
    // console.log('初始化结果：', JSON.stringify(initRet))
    if (initRet.surplusCount > 0) {
      for (let j = 0; j < initRet.surplusCount; j++) {
        const checkCanLottery = await mbactFunc($, 'checkCanLottery', actionNum)
        if (!checkCanLottery) {
          continue
        }
        await $.wait(1000)

        const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', `${actionNum}&sourcesNum=H5&featureCode=`)
        if (!lotteryStrengthen) {
          continue
        }
        $.msg += `赢得${lotteryStrengthen.prize_name}\n`
        console.log(`赢得${lotteryStrengthen.prize_name}`)
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
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})