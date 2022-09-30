const Env = require('./01Env')
const { initCookie } = require('./01js10086_common2')
const BrowserFinger = require('./function/BrowserFinger')

const $ = new Env('江苏移动_查账单')

 
// {phone:'13646197864', password: 'J19hktL8%2Brk%3D'},
const accounts = [
  {phone:'13813753702', password: 'ZrRfdOj5CCc%3D'},
  {phone:'15251300683', password: 'qDcHZjiDryg%3D'},
  {phone:'13584630864', password: 'J19hktL8%2Brk%3D'},
  {phone:'15851276468', password: '%2BJJhefIfe0c%3D'}
]


!(async () => {
  $.msg = ''
  for (let i = 0; i < accounts.length; i++) {
    $.phone = accounts[i].phone
    $.password = accounts[i].password
    const success = await initCookie($)
    if (!success) {
      $.msg += `${$.phone}登录失败......\n\n`
      continue
    }

    const tips = await queryBillInfo()
    $.msg += tips
    $.msg += '\n\n'

    console.log(`${$.phone}:\n`)
    console.log(combineMessage(tips))
    console.log()

    $.wait(10000)
  }

  $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

function queryBillInfo() {
  return new Promise((resolve) => {
    const date = new Date()
    let month = date.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    const queryMonth = '' + date.getFullYear() + month
    const mobile = BrowserFinger.encryptByDES($.phone)
    const data = {
      "wapContext": {
        "channel": "",
        "netType": "",
        "optType": "3",
        "bizCode": "ZDCX",
        "pageCode": "ZDCX",
        "markCdeo": `${mobile}-ZDCX-ZDCX-${date.getTime()}`,
        "subBizCode": "queryBillInfo",
        "effect": "",
        "verifyCode": ""
      },
      mobile,
      queryMonth
    }
    const op = {
      url: 'http://wap.js.10086.cn/vw/gateway/biz/billQuery/queryBillInfo',
      headers: { 
        'Connection': 'keep-alive', 
        'Pragma': 'no-cache', 
        'Cache-Control': 'no-cache', 
        'Accept': 'application/json, text/plain, */*', 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 
        'Content-Type': 'application/json;charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Referer': 'http://wap.js.10086.cn/', 
        'Accept-Language': 'zh-CN,zh;q=0.9', 
        'Cookie': $.setCookie  
      },
      body : JSON.stringify(data)
    }
    // console.log(JSON.stringify(op))
    // console.log()
    // console.log()
    
    $.post(op, async (err, resp, data) => {
      if (err) throw Error(err)
      // console.log(data)
      // console.log()
      // console.log()

      data = JSON.parse(data)

      resolve(combineMessage(data))
      // resolve(true)
    })
  })
}

function combineMessage(data) {
  if (data.success != '0' || !data.data) {
    return ''
  }
  const billInfo = data.data.billInfo
  const feeList = billInfo.feeDetailInfo

  // let message = `${$.phone}: \n`
  let message = ''
  for (let i = 0; i < feeList.length; i++) {
    const fee = feeList[i]
    message += `  ${fee.levelDbiName}: \n`
    const feeDetails = fee.feeDetails
    for (let j = 0; j < feeDetails.length; j++) {
      const feeDetail = feeDetails[j]
      message += `    ${feeDetail.feeName}: ${feeDetail.fee}元\n`
    }
  }
  message += `共计: ${billInfo.actualPay}${billInfo.unit}`

  return message
}