class WebApi {
  constructor(vm) {
    this.vm = vm
    this.BrowserFinger = require('./BrowserFinger')
  }

  // 首页
  queryIndexTopBar() {
    return new Promise((resolve) => {

      const wapContext = {
        bizCode: "INDEX",
        pageCode: "INDEX"
      }
      const op = this.getOptions('indexTopBar', this.vm.setCookie, this.getData(this.vm.phone, wapContext))

      this.post(op, resolve)
    })
  }

  // 账单
  queryBillInfo() {
    return new Promise((resolve) => {
      const wapContext = {
        "bizCode": "ZDCX",
        "pageCode": "ZDCX",
        "subBizCode": "queryBillInfo"
      }
      const date = new Date()
      let month = date.getMonth() + 1
      if (month < 10) {
        month = '0' + month
      }
      const queryMonth = '' + date.getFullYear() + month
      const others = {
        phone: this.vm.phone,
        queryMonth
      }
      const bodyParams = this.getData(this.vm.phone, wapContext, others)
      const op = this.getOptions('billQuery/queryBillInfo', this.vm.setCookie, bodyParams)

      this.post(op, resolve)
    })
  }

  // 流量充值记录
  initLLCZJL() {
    return new Promise(resolve => {
      const wapContext = {
        pageCode: 'LLCZJL',
        bizCode: 'LLCZJL',
        subBizCode: 'initLLCZJL-init'
      }
      const bodyParams = this.getData(this.vm.phone, wapContext)
      const op = this.getOptions('LLCZJL/initLLCZJL', this.vm.setCookie, bodyParams)

      this.post(op, resolve)
    })
  }

  combineIndexBarMessage(data) {
    if (data.success != '0' || data.code != '200') {
      return ''
    }

    const ret = data.data

    let speech = `\t\t\t\t${ret.commonSpeechDashboard.bordTitle}: ${ret.commonSpeechDashboard.value}${ret.commonSpeechDashboard.unit}\n`
    let gprs = `\t\t\t\t${ret.commonGPRSDashboard.bordTitle}: ${ret.commonGPRSDashboard.value}${ret.commonGPRSDashboard.unit}\n`
    let other = `\t\t\t\t${ret.otherGPRSDashboard.bordTitle}: ${ret.otherGPRSDashboard.value}${ret.otherGPRSDashboard.unit}\n\n`

    let r = '[庆祝]\t套餐剩余: \n' + speech + gprs + other
    r = r.replaceAll(/<font size="3" color="red">/gi, '').replaceAll(/<\/font>/gi, '').replaceAll(/\t/gi, '  ')

    return r
  }

  combineBillInfoMessage(data) {
    if (data.success != '0' || !data.data) {
      return ''
    }
    const billData = data.data
    const billInfo = billData.billInfo
    const feeList = billInfo.feeDetailInfo

    let message = ''
    for (let i = 0; i < feeList.length; i++) {
      const fee = feeList[i]
      if (fee.levelDbiName.indexOf("套餐外") > -1 || fee.levelDbiName.indexOf("增值") > -1) {
        message += `[庆祝]\t<font size="3" color="red">${fee.levelDbiName}:</font>\n`
        const feeDetails = fee.feeDetails
        for (let j = 0; j < feeDetails.length; j++) {
          const feeDetail = feeDetails[j]
          message += `\t\t\t\t<font size="3" color="red">${feeDetail.feeName}: ${feeDetail.fee}元</font>\n`
        }
      } else {
        message += `[庆祝]\t${fee.levelDbiName}:\n`
        const feeDetails = fee.feeDetails
        for (let j = 0; j < feeDetails.length; j++) {
          const feeDetail = feeDetails[j]
          message += `\t\t\t\t${feeDetail.feeName}: ${feeDetail.fee}元\n`
        }
      }
    }
    message += '\n'
    message += `本月消费: ${billInfo.actualPay}${billInfo.unit}\n`
    message += `当前余额: ${billData.accountBalance}元`

    message = message.replaceAll(/<font size="3" color="red">/gi, '').replaceAll(/<\/font>/gi, '').replaceAll(/\t/gi, '  ')

    return message
  }

  // common
  post(op, resolve) {
    this.vm.post(op, (err, resp, data) => {
      if (err) throw Error(err)

      data = JSON.parse(data)
      resolve(data)
    })
  }

  getOptions(apiName, ck, bodyParams) {
    return {
      url: `https://wap.js.10086.cn/vw/gateway/biz/${apiName}`,
      headers: this.getHeaders(ck),
      body: JSON.stringify(bodyParams)
    }
  }

  getHeaders(ck) {
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
  getData(phone, wapContext, others = {}) {
    const dateTime = (new Date()).getTime()
    const mobile = this.BrowserFinger.encryptByDES(phone)
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
}

module.exports = WebApi