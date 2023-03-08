/*
江苏移动_查话费
cron:0 10 8-22 * * *
*/
const Env = require('./common/Env')
const sendWX = require('./notice/WXLovelyCat_Notify')
const {sendNotify} = require('./notice/SendNotify')
const {initCookie} = require('./web/webLogin')
const WebApi = require('./web/webApi')
const $ = new Env('江苏移动_查话费')
const webApi = new WebApi($)

const js10086 = require('./web/js10086_chf')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
    cookiesArr.push(js10086[item])
})

const noticeConfig = JSON.parse(process.env.WX_NOTICE_CONFIG || {})
const hours = (new Date()).getHours()

!(async () => {
    $.message = ''
    for (let i = 0; i < cookiesArr.length; i++) {
        $.singleMessage = ''

        const cookie = cookiesArr[i]
        const success = await login(cookie)
        if (!success) {
            continue
        }

        await doActivity()
        console.log('------------------------------------------------\n\n\n')

        await $.wait(10000)
    }

    await sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})

async function doActivity() {
    const indexBar = await webApi.queryIndexTopBar()
    const tips = webApi.combineIndexBarMessage(indexBar)
    $.singleMessage += tips
    $.message += `${tips}\n`

    const billInfo = await webApi.queryBillInfo()
    const tips2 = webApi.combineBillInfoMessage(billInfo)
    $.singleMessage += tips2
    $.message += `${tips2}\n`

    const msg = `尊敬的${$.phone}用户，您的套餐详情如下：\n${$.singleMessage}`;
    if ((hours === 8 || hours === 18) && $.singleMessage.length > 0) {
        sendWX(msg, [$.wxid])
    }
    $.log(msg)
}

// login
async function login(cookie) {
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    $.password = cookie.match(/passwd=([^; ]+)(?=;?)/) && cookie.match(/passwd=([^; ]+)(?=;?)/)[1]
    $.wxid = noticeConfig[$.phone]
    $.message += `<font size="5">${$.phone}</font>: \n`

    const ck = await initCookie($.phone, $.password)
    if (!ck) {
        $.message += `登录失败，结束当前账号运行......\n`
        console.log(`登录失败，结束当前账号运行......`)
        return false
    }
    $.setCookie = ck
    return true
}