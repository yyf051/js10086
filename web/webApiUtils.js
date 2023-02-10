function getOptions(apiName, ck, bodyParams) {
  return {
    url: `https://wap.js.10086.cn/vw/gateway/biz/${apiName}`,
    headers: getHeaders(ck),
    body: JSON.stringify(bodyParams)
  }
}

function getHeaders(ck) {
  return { 
    'Connection': 'keep-alive', 
    'Pragma': 'no-cache', 
    'Cache-Control': 'no-cache', 
    'Accept': 'application/json, text/plain, */*', 
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
    'Content-Type': 'application/json;charset=UTF-8', 
    'Origin': 'https://wap.js.10086.cn', 
    'Sec-Fetch-Site': 'same-origin', 
    'Sec-Fetch-Mode': 'cors', 
    'Sec-Fetch-Dest': 'empty', 
    'Referer': 'https://wap.js.10086.cn/', 
    'Accept-Language': 'zh-CN,zh;q=0.9', 
    'Cookie': ck
  }
}

/**
 * wapContext: {
 *  bizCode: required
 *  pageCode: required
 *  suBizCode: optional
 * }
 */
function getData(phone, wapContext, others = {}) {
  const dateTime = (new Date()).getTime()
  const mobile = BrowserFinger.encryptByDES(phone)
  return {
    "wapContext": {
      "channel": "",
      "netType": "",
      "optType": "3",
      "effect": "",
      "verifyCode": "",
      "markCdeo": `${mobile}-${wapContext.pageCode}-${wapContext.bizCode}-${dateTime}`,
      "subBizCode": wapContext.subBizCode || "",
      ...wapContext
    },
    ...others
  }
}

module.exports = {
	getOptions, getData
}