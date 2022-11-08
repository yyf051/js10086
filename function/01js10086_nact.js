const url = `https://wap.js.10086.cn/nact/action.do`
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366  Jsmcc/1.0 ua=jsmcc&loginmobile=0a5b99bfb7fb26214a146094942d4d91&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&platform=iphone&channel=sd&ch=03&version=8.4.9&netmode=WiFi&time=20220308151203&lng=7effded641d49c4f&lat=7effded641d49c4f&poi=(null)&cityCode=(null)&JType=0&platformExpland=iPhone%208&idfaMd5=CB272611-A585-4786-9DE1-23BC50B73007&cmtokenid=E0157A381A2741979E9AB324F2370CC3@js.ac.10086.cn'


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

function nactFunc (vm, params, isDirectReturnResultObj = false, isLog = false) {
  return new Promise((resolve, reject) => {
    try {
      const options = {
        url,
        headers: getHeaders(vm),
        // body: vm.body
        body: serialize(params)
      }
      // if (vm.isLog || isLog) console.log('执行参数', options)
      vm.post(options, async (err, resp, data) => {
        console.log()
        if (vm.isLog || isLog) console.log(`${params.actCode}_${params.method}返回结果：${data}`)
        if (err) throw new Error(err)
        data = JSON.parse(data)
        if (data && data.success) {
          const resultObj = data.resultObj
          if (vm.isDirectReturnResultObj || isDirectReturnResultObj) {
            // 直接返回结果
            return resolve(resultObj)
          }
          let ret = false
          let message = ''
          if (!resultObj.isApp) {
            message += `${params.actCode}_${params.method}非APP使用;\n`
          } else if (resultObj.errorCode) {
            message += `查询信息失败, ${resultObj.errorMsg || data.resultMsg};\n`
          } else {
            ret = resultObj
          }
          console.log(message)
          vm.msg += message
          resolve(ret)
        } else {
          console.log('请求失败：', params, JSON.stringify(data))
        }
      })
    } catch(e) {
      console.log(`执行失败`, e)
      resolve()
    } finally {
    }
  })
}

module.exports = {
  nactFunc
}