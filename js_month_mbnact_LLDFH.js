/*
江苏移动_流量大富豪
cron:45 55 8 5 * *
*/
const Env = require('./01Env')
const { options, initCookie } = require('./01js10086_common')
const { mbactFunc } = require('./01js10086_mbnact')

const $ = new Env('江苏移动_流量大富豪')
const actionNum = '700000764'

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
  // for (let i = 0; i < 1; i++) {
    await initCookie($, i)

    // 1. 查询资格条件
    const preRet = await mbactFunc($, 'entitle/preconditions', actionNum)
    if (!preRet) {
      continue
    } else if (!preRet.qualified) {
      $.msg += `查无资格\n`
      console.log(`查无资格`)
    }

    // 2. 检查账户
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

        await lotteryStrengthen()
      }
    } else {
      // 无机会，进行兑换
      let queryResult = await queryEntitleDHSurplus()
      while (queryResult) {
        const addResult = await entitleDhlAdd()
        if (addResult) {
          await lotteryStrengthen()
        }

        await $.wait(15000)
        queryResult = await queryEntitleDHSurplus()
      }
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


async function entitleDhlAdd() {
  const addResult = await mbactFunc($, 'entitleDhlAdd', `${actionNum}&taskNum=DHLZG_LLDH&exchangeAmount=500`)
  await $.wait(1000)

  if (!addResult) {
    return
  }
  
  return true
}


async function queryEntitleDHSurplus() {
  const queryResult = await mbactFunc($, 'queryEntitleDHSurplus', `${actionNum}&dhflag=LL`)
  await $.wait(1000)
  
  if (!queryResult) {
    return
  }
  if (!queryResult.islimiteduser && queryResult.surplus >= 700) {
    return true
  } else {
    if (queryResult.islimiteduser) {
      $.msg += `黑名单用户，无法进行活动\n`
      console.log(`黑名单用户，无法进行活动`)
    } else if (queryResult.surplus < 700) {
      $.msg += `剩余套内流程${queryResult.surplus}，不足700M，无法进行活动\n`
      console.log(`剩余套内流程${queryResult.surplus}，不足700M，无法进行活动`)
    }
    return false
  }
}


async function lotteryStrengthen() {
  const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', `${actionNum}&sourcesNum=H5&featureCode=`)
  await $.wait(2000)

  if (!lotteryStrengthen) {
    return
  }
  $.msg += `赢得${lotteryStrengthen.prize_name}\n`
  console.log(`赢得${lotteryStrengthen.prize_name}`)
}