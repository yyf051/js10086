/*
江苏移动_流量大富豪
cron:45 55 8 5 * *
*/
const Env = require('./function/Env')
const { getMobileCK } = require('./app/appLogin')
const { mbactFunc } = require('./app/appMbnact')

const $ = new Env('江苏移动_流量大富豪')
const actionNum = '700000764'

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
    
    // 1. 查询资格条件
    const preRet = await mbactFunc($, 'entitle/preconditions', actionNum)
    if (!preRet) {
      continue
    } else if (!preRet.qualified) {
      $.message += `查无资格\n`
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
    $.message += `\n`
    await $.wait(10000)
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
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
      $.message += `黑名单用户，无法进行活动\n`
      console.log(`黑名单用户，无法进行活动`)
    } else if (queryResult.surplus < 700) {
      $.message += `剩余套内流程${queryResult.surplus}，不足700M，无法进行活动\n`
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
  $.message += `赢得${lotteryStrengthen.prize_name}\n`
  console.log(`赢得${lotteryStrengthen.prize_name}`)
}