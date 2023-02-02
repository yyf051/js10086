/*
http://wap.js.10086.cn/nact/resource/xxxx/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_查找活动
cron:1 1 1 1 1
*/
const Env = require('./function/01Env')

const $ = new Env('江苏移动_查找活动')
!(async () => {
  $.msg = ''
  for (let i = 2460; i < 2470; i++) {
    const url = `https://wap.js.10086.cn/nact/resource/${i}/html/index.html`
    $.get({url}, async (err, desp, data) => {
      if (data && data.indexOf('404') == -1) {
        console.log(`${url}\n`)
      }
    })
    await $.wait(10000)
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})