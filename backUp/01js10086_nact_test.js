const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_抽奖天天乐')
!(async () => {
  $.msg = ''
  for (let i = 2460; i < 2470; i++) {
    const url = `https://wap.js.10086.cn/nact/resource/${i}/html/index.html`
    $.get({url}, async (err, desp, data) => {
      if (data && data.indexOf('404') == -1) {
        console.log(i)
      }
    })
    await $.wait(10000)
  }
  // console.log(`通知内容：\n\n`, $.msg)
  // await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})