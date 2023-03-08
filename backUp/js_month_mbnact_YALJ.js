const Env = require('./common/Env')
const $ = new Env('江苏移动_用爱连接')

const { options, initCookie } = require('./common/01js10086_common')
const { mbactFunc } = require('./common/01js10086_mbnact')

!(async () => {
  $.message = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)
    console.log(`${$.phone}获取活动信息......`)
    const checkCanLottery = await mbactFunc($, 'checkCanLottery', '700002439')
    if (!checkCanLottery) {
      continue
    }
    await $.wait(1000)

    const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', '700001985&sourcesNum=H5&featureCode=')
    if (!lotteryStrengthen) {
      continue
    }
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})