const { ua, options } = require('./01js10086_common')

const hostPath = 'https://wap.js.10086.cn/mb_nact/new/yxwap'

/* 用户信息
{
  "tenantNum": "00000000",
  "userId": "247486086065",
  "userStatus": "1",
  "userName": "1**********",
  "headUrl": "",
  "appOpenId": "138****3702",
  "registerTime": "20201111110158",
  "lastLoginTime": "20201111110158",
  "cityId": "20",
  "userToken": "g5fpgof4cs7o8ilo6egquuo783pi99kf6g4ok82drv31fmibuca"
}
*/
function getUserInfo(vm) {
  const options = {
    'url': `${hostPath}/getUserInfo`,
    'headers': getHeaders(vm)
  }
  vm.get(options, async (err, resp, data) => {
    console.log(`getUserInfo: ${data}`)
    if (err) throw new Error(err)
    data = JSON.parse(data)
    resolve(data)
  })
}

/**
 * 活动通用查询接口
 */
function mbactFunc(vm, funcName, actNum, body) {
  return new Promise((resolve, reject) => {
    try {
      const url = `${hostPath}/${funcName}?actNum=${actNum}`
      const options = { url, headers: getHeaders(vm) }
      if (body) {
        options.body = JSON.stringify(body)
        vm.post(options, async (err, resp, data) => {
          if (err) throw new Error(err)
          // console.log(`${funcName}_${actNum}: ${data}`)
          data = data && JSON.parse(data)
          let ret = false
          if (data.success && data.code == '1') {
            ret = data.data || true
          }
          resolve(ret)
        })
      } else {
        vm.get(options, async (err, resp, data) => {
          if (err) throw new Error(err)
          // console.log(`${funcName}_${actNum}: ${data}`)
          if(!data) {
            console.log(`${vm.name} 活动查询失败，数据为空\n`)
            vm.msg += `${vm.name} 活动查询失败，数据为空\n`
          }
          data = data && JSON.parse(data)
          let ret = false
          if (data.success && data.code == '1') {
            ret = data.data || true
          } else if (!data.success && data.message) {
            console.log(`${vm.name} 执行失败：${data.message}\n`)
            vm.msg += `${vm.name} 执行失败：${data.message}\n`
          }
          resolve(ret)
        })
      }
    } catch(e) {
      console.log(`执行失败`, e)
      resolve()
    } finally {
    }
  })
}

function getHeaders(vm) {
  // console.log(`mbnact： ${vm.setCookie}`)
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept-Encoding': 'br, gzip, deflate',
    'Connection': 'keep-alive',
    'Accept': '*/*',
    'Referer': 'https://wap.js.10086.cn/',
    'Accept-Language': 'en-us',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': vm.setCookie,
    'User-Agent': vm.ua
  }
}


module.exports = {
  mbactFunc, getUserInfo
}