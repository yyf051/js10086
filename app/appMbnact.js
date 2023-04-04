const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366  Jsmcc/1.0 ua=jsmcc&loginmobile=0a5b99bfb7fb26214a146094942d4d91&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&platform=iphone&channel=sd&ch=03&version=8.4.9&netmode=WiFi&time=20220308151203&lng=7effded641d49c4f&lat=7effded641d49c4f&poi=(null)&cityCode=(null)&JType=0&platformExpland=iPhone%208&idfaMd5=CB272611-A585-4786-9DE1-23BC50B73007&cmtokenid=E0157A381A2741979E9AB324F2370CC3@js.ac.10086.cn'

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
function mbactFunc(vm, funcName, actNum, body, isLog = false) {
  return new Promise((resolve) => {
    try {
      isLog = isLog || process.env.isLog
      const url = `${hostPath}/${funcName}?actNum=${actNum}`
      const options = { url, headers: getHeaders(vm) }
      isLog && console.log(`mbactFunc options: `, options)
      if (body) {
        options.body = JSON.stringify(body)
        vm.post(options, async (err, resp, data) => {
          if (err) throw new Error(err)
          isLog && console.log(`${funcName}_${actNum}: ${data}`)
          data = data && JSON.parse(data)
          let ret = false
          if (data.success && data.code === '1') {
            ret = data.data || true
          }
          resolve(ret)
        })
      } else {
        vm.get(options, async (err, resp, data) => {
          if (err) throw new Error(err)
          isLog && console.log(`${funcName}_${actNum}: ${data}`)
          if(!data) {
            console.log(`${vm.name} 活动查询失败，数据为空\n`)
            vm.msg += `${vm.name} 活动查询失败，数据为空\n`
          }
          data = data && JSON.parse(data)
          let ret = false
          if (data.success && data.code === '1') {
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
    'User-Agent': ua
  }
}


module.exports = {
  mbactFunc
}