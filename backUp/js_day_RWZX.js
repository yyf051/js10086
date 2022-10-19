/*
江苏移动_任务中心
cron:25 40 10 * * *
*/
const Env = require('./function/01Env')
let $ = new Env()

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

const headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Cookie': 'WT_FPC=id=241171424cc8d3be7021647602602881:lv=1647602618088:ss=1647602602881',
	'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366/wkwebview leadeon/7.6.1/CMCCIT',
	'Accept-Language': 'en-us',
	'Accept-Encoding': 'br, gzip, deflate',
	'Connection': 'keep-alive'
}

function getHeaders() {
	const h = headers
	h.Cookie = setConstCookie()

	return h
}

function getXHRHeaders() {
	const h = headers
	h['Content-Type'] = 'application/json;charset=UTF-8'
	h['X-Requested-With'] = 'XMLHttpRequest'
	h['Accept'] = 'application/json, text/javascript, */*; q=0.01'

	return h
}

function getResponseSetCookie (resp) {
  let c = {}
  for (const ck of resp['headers']['set-cookie']) {
    const k = ck.split(';')[0]
    c[k.split('=')[0]] = k.split('=')[1]
  }
  return c
}

$.ServerApiSession = ''
/**
 * 从此接口中获取后续查询任务需要的SESSION
 */
const activityURL = `https://wx.10086.cn/qwhdhub/qwhdmark/1021122301?touch_id=JTST_P00000010996&yx=JHQD9999999999`
function getServerApiSession() {
	return new Promise((resolve) => {
		const url = activityURL
		const headers = getHeaders()

		const options = {
			url, headers
		}

		$.get(options, async (err, resp, data) => {
			if (err) throw Error(err)

			const ret = getResponseSetCookie(resp)
			$.ServerApiSession = ret.SESSION
			console.log('ServerApiSession: ' + $.ServerApiSession)

			resolve(true)
		})
	})
}

$.ServerSSOSession = ''
/**
 * 从此接口中获取后续SSO的SESSION
 */
function getServerSSOSession() {
	return new Promise((resolve) => {
		const url = `https://wx.10086.cn/qwhdsso/login?dlwmh=true&actUrl=${encodeURIComponent(activityURL)}`
		const headers = getHeaders()
		let ck = 'sajssdk_2015_cross_new_user=1; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2217f9c537b9240b-02ad92936bdd0d-142f442a-250125-17f9c537b93ac5%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%7D%2C%22%24device_id%22%3A%2217f9c537b9240b-02ad92936bdd0d-142f442a-250125-17f9c537b93ac5%22%7D; '
		const cookie = `${ck}${setConstCookie()}; touch_id=JTST_P00000010996; yx=JHQD9999999999`
		headers.Cookie = cookie

		const options = {
			url, headers
		}

		console.log(options)
		$.get(options, async (err, resp, data) => {
			if (err) throw Error(err)

			const ret = getResponseSetCookie(resp)
			$.ServerSSOSession = ret.SESSION
			console.log('ServerSSOSession: ' + $.ServerSSOSession)

			resolve()
		})
	})
}

function chinaMobileApp() {
	const url = `https://wx.10086.cn/qwhdsso/chinaMobileApp`
	const headers = getXHRHeaders()
	headers.Cookie = $.ServerSSOSession

	const body = {
	    "openid": "TsJMoD0vez4l2pNTTbwf4A==",
	    "mobile": "mhrzb4a6763045aaa0e75ee34adc4757",
	    "provinceCode": "250",
	    "isMobilePhone": false,
	    "appVersionCode": "7.6.1"
	}
}

function taskList() {
	return new Promise((resolve) => {
		const url = `https://wx.10086.cn/qwhdhub/api/mark/task/taskList`
		const headers = getXHRHeaders()
		let ck = 'sajssdk_2015_cross_new_user=1; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2217f9c537b9240b-02ad92936bdd0d-142f442a-250125-17f9c537b93ac5%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%7D%2C%22%24device_id%22%3A%2217f9c537b9240b-02ad92936bdd0d-142f442a-250125-17f9c537b93ac5%22%7D; '
		const cookie = `${ck}SESSION=${$.ServerApiSession}; ${setConstCookie()}; touch_id=JTST_P00000010996; yx=JHQD9999999999`
		headers.Cookie = cookie
		
		const options = {
			url, headers,
			body: '{}'
		}

		console.log(options)
		$.post(options, async (err, resp, data) => {
			if (err) throw Error(err)
			console.log('taskList请求的结果: ' + data)
		})
	})
}

!(async () => {
  await getServerApiSession()

  await getServerSSOSession()

  await taskList()
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})