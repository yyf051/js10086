const { options } = require('../conf/config')

const Env = require('./01Env')
let $ = new Env()


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

const redisConfig = {
  host: 'nas.hermanwu.zt',
  port: 36379,
  password: 'abc123__'
}
const redis = require("ioredis")
const config = require('../conf/globalConfig').redisConfig
const cacheKey = 'ChinaMobileCK'
const initCache = require('./cache')

const loginUrl = 'https://wap.js.10086.cn/jsmccClient/action.dox'

const defaultHeader = {
  'Host': 'wap.js.10086.cn',
  'LC-PN': '13813753702',
  'version': '8.4.9',
  'Accept': '*/*',
  'LC-IFS': 'login_lnNew',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Accept-Language': 'en-us',
  'hgvhv': '891DaDB4FbED634EF0AF498F6EE6005F89',
  'platform': 'iphone',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
  'jailBreak': '0',
  'LC-SYSVERSION': '12.0',
  'device': 'iPhone 8',
  'appchannel': 'App Store',
  'carrier': ''
}

const getOption = (phone, body) => {
  return {
    'url': loginUrl,
    'headers': {
      ...defaultHeader,
      'LC-PN': phone
    },
    'body': `appBodyParam=${body}`
  }
}

async function getMobieCK(phone, loginBody) {

  // 获取登陆参数
  const opt = getOption(phone, loginBody)

  // redis 
  const client = redis.createClient(config)
  try {
    // const phone = opt.headers['LC-PN']
    console.log(`Current phone: ${phone}`)

    const cache = initCache(client)
    let setCookie = await cache.hget(cacheKey, phone)
    if (!setCookie) {
      setCookie = await initCookie(opt)

      console.log('请求成功并缓存ck')
      await cache.hset(cacheKey, phone, setCookie)
      const seconds = 20 * 60 // 20 min expire
      // console.log('超时秒数：', seconds)
      await cache.expire(cacheKey, seconds)
    } else{
      console.log(`从缓存中获取ck`)
    }
    return setCookie
  } catch (x) {
    console.log(`获取Cookie失败！${x}`)
  } finally {
    client.quit()
  }
}


function initCookie(opt) {
  return new Promise(async (resolve) => {
    try {
      const phone = `${opt.headers['LC-PN']}`
      console.log(`${phone}获取JSESSIONID......`)

      let setCookie = await recall()
      if (!setCookie) {
        console.log(`${phone}第二次获取JSESSIONID......`)
        setCookie = await recall()
      }
      console.log(`${phone}获取Cookie......`)
      const cks = await Promise.all([
        getCookie(opt, setCookie),
        getExtendCookie3(setCookie)
      ])
      setCookie += cks.join('')
      setCookie += setConstCookie()

      resolve(setCookie)
    } catch (e) {
      console.log('登录失败', e)
    }
  })
}

module.exports = {
  options, getMobieCK
}