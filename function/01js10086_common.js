const Env = require('./01Env')
let $ = new Env()

const config = require('../conf/config')
const ua = config && config.ua
const encryptedPhone = config && config.encryptedPhone
const options = config && config.options

const cache = require('./cache')
const cacheKey = 'ChinaMobileCK'

function getSetCookie (resp) {
  let c = ''
  for (const ck of resp['headers']['set-cookie']) {
    c += `${ck.split(';')[0]};`
  }
  return c
  // console.log('获取SET-COOKIE：', c)
}

/**
 * 模拟进入
 */
function enter () {
  return new Promise((resolve, reject) => {
    const options = {
      'url': 'https://wap.js.10086.cn/bigdata/v3/enter',
      'headers': {
        'Host': 'wap.js.10086.cn',
        'Accept': '*/*',
        'User-Agent': 'ecmc/14 CFNetwork/974.2.1 Darwin/18.0.0',
        'Accept-Language': 'en-us',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        '20220308103057enterIOSclientIOSQ6AIZLD0N9EF0DD|8.4.971GYPE9XTQD941813375d2766205520220308103057IOS_P_WODE_01': ''
      }
    }
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      // console.log('enter:'+data);
      resolve()
    })
  })
}

/**
 * 获取JSESSIONID
 */
function recall () {
  return new Promise((resolve, reject) => {
    const options = {
      'url': 'https://wap.js.10086.cn/jsmccClient/cd/market_content/api/v1/market_content.show.recall',
      'headers': {
        'Host': 'wap.js.10086.cn',
        'Accept': '*/*',
        'User-Agent': 'ecmc/8.4.9 (iPhone; iOS 12.0; Scale/2.00)',
        'Accept-Language': 'en-CN;q=1, zh-Hans-CN;q=0.9, te-CN;q=0.8, zh-Hant-CN;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'channelNum': 'IOS',
        'version': '8.4.9',
        'isApiAd': '0',
        'regionNum': '',
        'adContentMainId': 'YG2000018409',
        'clientPageParams': '{\n\n}',
        'deviceId': '891DDB4F-ED63-4EF0-AF49-8F6EE6005F89',
        'requestId': '',
        'videoState': '',
        'imei': 'CB272611-A585-4786-9DE1-23BC50B73007',
        'imeiType': '5',
        'seqId': '371b19af0649ff0b3280913ce03094951646705089904',
        'mobileNum': '',
        'showTime': '20220308100449'
      }
    }
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      // $.log("recall: "+data)
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
 * 获取相关cookie
 */
function getCookie (op, ck) {
  return new Promise((resolve, reject) => {
    op.headers.Cookie = ck
    $.post(op, async (err, resp, data) => {
      if (err) throw new Error(err)
      // $.log("getCookie: "+data)
      resolve(getSetCookie(resp))
    })
  })
}

function getExtendCookie1 () {
  return new Promise((resolve, reject) => {
    const options = {
      'url': 'https://wap.js.10086.cn/PL1.thtml',
      'headers': {
        'Host': 'wap.js.10086.cn',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366',
        'Accept-Language': 'en-us'
      }
    }
    $.get(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      resolve(getSetCookie(resp))
    })
  })
}

function getExtendCookie2 () {
  return new Promise((resolve, reject) => {
    const options = {
      'url': 'https://wap.js.10086.cn/PL2.thtml',
      'headers': {
        'Host': 'wap.js.10086.cn',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366',
        'Accept-Language': 'en-us'
      }
    }
    $.get(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      resolve(getSetCookie(resp))
    })
  })
}

function getExtendCookie3 (ck) {
  return new Promise((resolve, reject) => {
    const options = {
      'url': 'https://wap.js.10086.cn/PL3.thtml',
      'headers': {
        'Host': 'wap.js.10086.cn',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': ck,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366',
        'Accept-Language': 'en-us'
      }
    }
    $.get(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      resolve(getSetCookie(resp))
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
  // return "WT_FPC=id=" + $t + ":lv=" + $u.getTime().toString() + ":ss=" + $w.getTime().toString() ;
  ck += 'WT_FPC=id=' + $t + ':lv=' + $u.getTime().toString() + ':ss=' + $w.getTime().toString()
  //   console.log('setConstCookie：', ck)
  return ck
}

function getCacheCookie(phone) {
  return new Promise(async (resolve) => {
    const cckk = await cache.hget(cacheKey, phone)
    cache.client.quit()
    resolve(cckk)
  })
}

function initCookie(vm, i) {
  return new Promise(async (resolve) => {
    // await vm.wait(5000)
    try {
      if (i == undefined) i = vm.index
      vm.ua = ua[i]
      vm.phone = options[i].headers['LC-PN']
      vm.accountName = `账号${vm.phone}`
      vm.msg += `<font size="5">${vm.phone}</font>\n`
      console.log(`${vm.accountName}获取JSESSIONID......`)

      // 先从redis中获取ck
      const cacheCK = await getCacheCookie(vm.phone)
      if (cacheCK) {
        console.log('获取缓存成功')
        vm.setCookie = cacheCK
      } else {
        // 没找到则重新获取CK
        vm.setCookie = await recall()
        if (!vm.setCookie) {
          console.log(`${vm.accountName}第二次获取JSESSIONID......`)
          vm.setCookie = await recall()
        }
        console.log(`${vm.accountName}获取Cookie......`)
        const cks = await Promise.all([
          getCookie(options[i], vm.setCookie),
          getExtendCookie3(vm.setCookie)
        ])
        vm.setCookie += cks.join('')
        vm.setCookie += setConstCookie()

        console.log('缓存ck: ', vm.setCookie)
        cache.hset(cacheKey, vm.phone, vm.setCookie)
        const seconds = 60 * 60 // 1过期
        console.log('超时秒数：', seconds)
        cache.expire(cacheKey, seconds)
      }

      resolve(true)
    } catch (e) {
      console.log('登录失败', e)
    }
  })
}

module.exports = {
  ua, options, encryptedPhone,
  enter, recall, 
  getExtendCookie1, getExtendCookie2, getExtendCookie3, getCookie, setConstCookie, initCookie
}