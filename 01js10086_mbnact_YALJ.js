const Env = require('./01Env')
const $ = new Env('江苏移动_用爱连接')

const { options, initCookie } = require('./01js10086_common')
const { mbactFunc } = require('./01js10086_mbnact')

!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)
    console.log(`${$.accountName}获取活动信息......`)
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
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})