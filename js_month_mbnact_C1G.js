/*
江苏移动_抽1GB
cron:45 35 12 1 * *
*/
const Env = require('./function/01Env')
const { getMobieCK } = require('./function/01js10086_common')
const { mbactFunc } = require('./function/01js10086_mbnact')

const $ = new Env('江苏移动_抽1GB')
const actionNum = '700001898'

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