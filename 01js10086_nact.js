const { ua, options } = require('./01js10086_common')

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
            // if (resultObj.openLog) {
            //   // 流量大富翁有这个字段
            //   console.log(`${vm.accountName}resultObj.openLog的结果是${JSON.stringify(resultObj.openLog)}\n`)
            //   ret = resultObj
            // } else {
              message += `查询信息失败, ${resultObj.errorMsg || data.resultMsg};\n`
            // }
          } else {
            // console.log(`${vm.accountName}正常返回结果\n`)
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