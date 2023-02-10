/*
http://wap.js.10086.cn/nact/resource/xxxx/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_查找活动
cron:1 1 1 1 1
*/
const Env = require('./function/Env')

const $ = new Env('江苏移动_查找活动')
!(async () => {
  $.message = ''
  for (let i = 2571; i <= 2600; i++) {
    const url = `https://wap.js.10086.cn/nact/resource/${i}/html/index.html`
    $.get({url}, async (err, desp, data) => {
      if (data && data.indexOf('404') == -1) {
        console.log(`${url}`)
      }
    })
    await $.wait(20000)
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})