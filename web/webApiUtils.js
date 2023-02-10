function getOptions(ck, phone, bizCode, pageCode, subBizCode, apiName) {
  return {
    url: `https://wap.js.10086.cn/vw/gateway/biz/${apiName}`,
    headers: getHeaders(ck),
    body: JSON.stringify(getData(phone, bizCode, pageCode, subBizCode))
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

function getData(phone, bizCode, pageCode, subBizCode) {
  const date = new Date()
  const mobile = BrowserFinger.encryptByDES(phone)
  pageCode = pageCode || bizCode
  return {
    "wapContext": {
      "channel": "",
      "netType": "",
      "optType": "3",
      "bizCode": bizCode,
      "pageCode": pageCode,
      "markCdeo": `${mobile}-${pageCode}-${bizCode}-${date.getTime()}`,
      "subBizCode": subBizCode || "",
      "effect": "",
      "verifyCode": ""
    }
  }
}

module.exports = {
	getOptions
}