//此处填写京东账号cookie。
let CookieJDs = [
]
// 判断环境变量里面是否有京东ck
if (process.env.JS10086_CHF) {
  if (process.env.JS10086_CHF.indexOf('&') > -1) {
    CookieJDs = process.env.JS10086_CHF.split('&');
  } else if (process.env.JS10086_CHF.indexOf('\n') > -1) {
    CookieJDs = process.env.JS10086_CHF.split('\n');
  } else {
    CookieJDs = [process.env.JS10086_CHF];
  }
}

CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共${CookieJDs.length}个移动账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString('zh', {hour12: false}).replace(' 24:',' 00:')}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
for (let i = 0; i < CookieJDs.length; i++) {
  if (!CookieJDs[i].match(/phone=(.+?);/) || !CookieJDs[i].match(/passwd=(.+?);/)) console.log(`\n提示:环境变量 【${CookieJDs[i]}】填写不规范,可能会影响部分脚本正常使用。正确格式为: phone=xxx;passwd=xxx;（分号;不可少）\n`);
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}
