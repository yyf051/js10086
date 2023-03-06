/*
http://wap.js.10086.cn/nact/resource/2287/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_开宝箱赢好礼
cron:40 10 9 * * *
*/
const Env = require('./function/Env')
const { getMobileCK } = require('./app/appLogin')
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366  Jsmcc/1.0 ua=jsmcc&loginmobile=0a5b99bfb7fb26214a146094942d4d91&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&platform=iphone&channel=sd&ch=03&version=8.4.9&netmode=WiFi&time=20220308151203&lng=7effded641d49c4f&lat=7effded641d49c4f&poi=(null)&cityCode=(null)&JType=0&platformExpland=iPhone%208&idfaMd5=CB272611-A585-4786-9DE1-23BC50B73007&cmtokenid=E0157A381A2741979E9AB324F2370CC3@js.ac.10086.cn'

const $ = new Env('江苏移动_开宝箱赢好礼')

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
    
    console.log(`${$.phone}获取活动信息......`)
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
      $.message += '\n'
      continue
    } else {
        if (initIndexPage.chanceState >= 3) {
            console.log(`${$.phone}今日已抽奖......`)
            $.message += `今日已抽奖......\n\n`
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
          $.message += `${doLottery.awardName}\n`
          console.log(`${doLottery.awardName}\n`)
        } else {
          $.message += `未中奖\n`
          console.log(`未中奖\n`)
        }
    }

    console.log()
    $.message += `\n`

    await $.wait(8000)
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
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
    'User-Agent': ua,
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
        console.log(`${params.actCode}_${params.method}返回结果：${data}`)
        if (err) throw new Error(err)
        data = JSON.parse(data)
        if (data && data.success) {
          const resultObj = data.resultObj
          let ret = false
          let message = ''
          if (!resultObj.isApp) {
            message += `${params.actCode}_${params.method}非APP使用;\n`
          } else {
            console.log(`${vm.phone}正常返回结果\n`)
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