const BrowserFinger = require('./BrowserFinger')

function getSetCookie (resp) {
  let c = ''
  for (const ck of resp['headers']['set-cookie']) {
    c += `${ck.split(';')[0]};`
  }
  return c
  // console.log('获取SET-COOKIE：', c)
}

/**
 * 获取JSESSIONID
 */
function getInitSessionID (vm) {    
  return new Promise((resolve) => {
    const data = {
      "wapContext": {
        "channel": "",
        "netType": "",
        "optType": "3",
        "bizCode": "INDEX",
        "pageCode": "INDEX",
        "markCdeo": "noExistMobile-INDEX-INDEX-" + (new Date()).getTime(),
        "subBizCode": "",
        "effect": "",
        "verifyCode": ""
      }
    }

    const options = {
      url: 'http://wap.js.10086.cn/vw/gateway/biz/marquee/getMarqueeByPAGENUM',
      headers: { 
        'Connection': 'keep-alive', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache', 
        'Accept': 'application/json, text/plain, */*', 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
        'Content-Type': 'application/json;charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Referer': 'http://wap.js.10086.cn/', 
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      body : JSON.stringify(data)
    }
    vm.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      // $.log("getInitSessionID: "+data)
      // resolve(getSetCookie(resp))
      try {
        resolve(getSetCookie(resp))
      } catch (e) {
        // await recall()
        resolve(false)
      }
    })
  })
}

/**
 * WT_FPC 可能用不到
 */
function setConstCookie (ck = '') {
  var $t = '2'
  var $u = new Date()
  var $w = new Date($u.getTime())

  if ($t.length < 10) {
    var $x = $u.getTime().toString()
    for (var i = 2; i <= (32 - $x.length); i++) $t += Math.floor(Math.random() * 16.0).toString(16)
    $t += $x
  }
  $t = encodeURIComponent($t)
  // return "WT_FPC=id=" + $t + ":lv=" + $u.getTime().toString() + ":ss=" + $w.getTime().toString() 
  ck += 'WT_FPC=id=' + $t + ':lv=' + $u.getTime().toString() + ':ss=' + $w.getTime().toString() + '; '
  //   console.log('setConstCookie：', ck)
  return ck
}

function checkLogin(vm) {
  return new Promise(async (resolve) => {
    const data = `reqUrl=CheckJSMobile&busiNum=CheckJSMobile&operType=3&mobile=${vm.phone}`

    const options = {
      url: 'http://wap.js.10086.cn/actionDispatcher.do',
      headers: { 
        'Connection': 'keep-alive', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache', 
        'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'X-Requested-With': 'XMLHttpRequest', 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Referer': 'http://wap.js.10086.cn/login.thtml?redirectURL=//wap.js.10086.cn/vw/index/home', 
        'Accept-Language': 'zh-CN,zh;q=0.9', 
        'Cookie': vm.setCookie
      },
      body : JSON.stringify(data)
    }

    vm.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      // $.log("getInitSessionID: "+data)
      resolve(getSetCookie(resp))
    })
  })
}

function login(vm) {
  return new Promise((resolve) => {
    const data = `reqUrl=loginTouch&busiNum=login&mobile=${vm.phone}&password=${vm.password}&passwordSMS_vaild=&isSavePasswordVal=&verifyCode=&isSms=0&ver=t&imgReqSeq=a8490160ff5f4f1b96df232a4a27c5ba1305&loginType=0`

    const options = {
      method: 'post',
      url: 'http://wap.js.10086.cn/actionDispatcher.do',
      headers: { 
        'Connection': 'keep-alive', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache', 
        'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'X-Requested-With': 'XMLHttpRequest', 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Referer': 'http://wap.js.10086.cn/login.thtml?redirectURL=//wap.js.10086.cn/vw/index/home', 
        'Accept-Language': 'zh-CN,zh;q=0.9', 
        'Cookie': vm.setCookie
      },
      body: data
    }

    vm.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      // $.log("getInitSessionID: "+data)
      resolve(getSetCookie(resp))
    })
  })
}

function initCookie(vm) {
  return new Promise(async (resolve) => {
    await vm.wait(5000)
    let success = false
    try {
      // console.log(`${vm.phone}获取JSESSIONID......`)
      vm.setCookie = await getInitSessionID(vm)
      if (!vm.setCookie) {
        console.log(`${vm.phone}第二次获取JSESSIONID......`)
        vm.setCookie = await getInitSessionID(vm)
      }
      // console.log(`${vm.phone}通过SESSION:${vm.setCookie}获取Cookie......`)
      vm.setCookie += setConstCookie()
      vm.setCookie += `mywaytoopen=${BrowserFinger.get({phone: vm.phone})}; `
      vm.setCookie += await checkLogin(vm)
      vm.setCookie += await login(vm)
      success = true
    } catch (e) {
      console.log('登录失败', e)
    } finally {
      resolve(success)
    }
  })
}

module.exports = {
  initCookie
}