const Env = require('./01Env')
const { options, initCookie } = require('./01js10086_common')
// const { nactFunc } = require('./01js10086_nact')

const $ = new Env('江苏移动_开宝箱赢好礼')
!(async () => {
  $.msg = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    console.log(`${$.accountName}获取活动信息......`)

    let params = {
      "reqUrl": "act2287",
      "method": "initIndexPage",
      "actCode": "2287",
      "extendParams": "",
      "ywcheckcode": "",
      "mywaytoopen": ""
    }
    const initIndexPage = await nactFunc($, params)
    if (!initIndexPage) {
      $.msg += '\n'
      continue
    } else {
        if (initIndexPage.chanceState >= 3) {
            console.log(`${$.accountName}今日已抽奖......`)
            $.msg += `今日已抽奖......\n\n`
            continue
        }
    }
    await $.wait(3000)
    
    let getChance = false
    for (let m = 3; m <= 5; m++) {
        params = {
          "reqUrl": "act2287",
          "method": "browse",
          "actCode": "2287",
          "extendParams": "",
          "ywcheckcode": "",
          "mywaytoopen": "",
          "operType": "1",
          "idType": m
        }
        // 3 // 5
        const browse = await nactFunc($, params)
        if (browse && browse.getChance) {
            getChance = browse.getChance
            break
        }
    }

    if (getChance) {
        params = {
          "reqUrl": "act2287",
          "method": "doLottery",
          "actCode": "2287",
          "extendParams": "",
          "ywcheckcode": "",
          "mywaytoopen": "",
          "operType": "1"
        }
        const doLottery = await nactFunc($, params)
        if (!doLottery) {
          continue
        }

        if (doLottery.isApp && doLottery.isWin) {
          $.msg += `${doLottery.awardName}\n`
          console.log(`${doLottery.awardName}\n`)
        } else {
          $.msg += `未中奖\n`
          console.log(`未中奖\n`)
        }
    }

    console.log()
    $.msg += `\n`

    await $.wait(8000)
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})
const url = `https://wap.js.10086.cn/nact/action.do`

function getHeaders(vm) {
  return {
    'Connection': 'keep-alive',
    'Content-Length': '99',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'hgvhv': 'null',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://wap.js.10086.cn',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://wap.js.10086.cn/',
    'Accept-Encoding': 'br, gzip, deflate',
    'Accept-Language': 'en-us',
    'User-Agent': vm.ua,
    'Cookie': vm.setCookie
  }
}

function serialize(params) {
  if (typeof params == 'string') {
    return params
  }

  let ret = ''
  for(let key in params) {
    ret += `&${key}=${params[key]}`
  }
  return ret && ret.substr(1)
}
function nactFunc (vm, params) {
  return new Promise((resolve, reject) => {
    try {
      const options = {
        url,
        headers: getHeaders(vm),
        // body: vm.body
        body: serialize(params)
      }
      vm.post(options, async (err, resp, data) => {
        console.log()
        // console.log(`${params.actCode}_${params.method}返回结果：${data}`)
        if (err) throw new Error(err)
        data = JSON.parse(data)
        if (data && data.success) {
          const resultObj = data.resultObj
          let ret = false
          let message = ''
          if (!resultObj.isApp) {
            message += `${params.actCode}_${params.method}非APP使用;\n`
          } else {
            console.log(`${vm.accountName}正常返回结果\n`)
            ret = resultObj
          }
          console.log(message)
          vm.msg += message
          resolve(ret)
        } else {
          console.log('请求失败：', JSON.stringify(data))
        }
      })
    } catch(e) {
      console.log(`执行失败`, e)
      resolve()
    } finally {
    }
  })
}