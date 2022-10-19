/*
江苏移动_刷视频赢福利
cron:0 40 8 * * *
*/
const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { mbactFunc } = require('./function/01js10086_mbnact')

const $ = new Env('江苏移动_刷视频赢福利')
!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    // https://wap.js.10086.cn/mb_nact/new/yxwap/entitle/preconditions?actNum=700002915&_t=1647156676735
    console.log(`${$.accountName}检查参与资格......`)
    const conditionRet = await mbactFunc($, 'entitle/preconditions', '700002915')
    if (!conditionRet) {
      continue
    }

    console.log(`${$.accountName}检查参与状态......`)
    const initRet = await mbactFunc($, 'checkEntitleAccount', '700002915')
    if (!initRet) {
      continue
    }
    if (initRet.surplusCount == 0) {
      $.msg += `无抽奖机会\n`
      console.log(`${$.accountName}无抽奖机会`)
      continue
    }
    for (let j = 0; j < initRet.surplusCount; j++) {
      const checkCanLottery = await mbactFunc($, 'checkCanLottery', '700002915')
      if (!checkCanLottery) {
        continue
      }
      await $.wait(1000)

      const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', '700002915&sourcesNum=H5&featureCode=')
      if (!lotteryStrengthen) {
        continue
      }
      $.msg += `赢得${lotteryStrengthen.prize_name}\n`
      console.log(`赢得${lotteryStrengthen.prize_name}\n`)
      await $.wait(2000)
    }
    
    console.log()
    $.msg += `\n`
    await $.wait(5000)
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})