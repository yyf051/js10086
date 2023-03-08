/*
http://wap.js.10086.cn/nact/resource/xxxx/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_xxxx
cron:25 43 10 5 * *
*/
const Env = require('./common/Env')
const {sendNotify} = require('./notice/SendNotify')
const {getMobieCK} = require('./app/appLogin')
const {nactFunc, getNactParams} = require('./app/appNact')

const $ = new Env('江苏移动_xxx')
const actCode = 'xxxx'

const js10086 = require('./common/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
    cookiesArr.push(js10086[item])
})

!(async () => {
    for (let i = 0; i < cookiesArr.length; i++) {
        const cookie = cookiesArr[i]
        const success = await login(cookie)
        if (!success) continue

        await execActivity()

        console.log(`-------------------------------------------------------\n\n\n`)
        await $.wait(10000)
    }

    console.log(`通知内容：\n\n`, $.message)
    await sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})

async function login(cookie) {
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])

    $.message = `<font size="5">${$.phone}</font>\n`
    if (!$.phone || !bodyParam) {
        $.message += `登陆参数配置不正确\n`
        return false
    }

    $.setCookie = await getMobieCK($.phone, bodyParam)
    return true
}

/**
 * 开始处理
 */
async function execActivity() {
    $.isLog = false
    $.isDirectReturnResultObj = true
    let resultObj = await initIndexPage()

    // special logic

}

/**
 * 初始化页面
 */
async function initIndexPage() {
    let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'), true)
    if (!resultObj) {
        throw Error('初始化活动失败...')
    }
    return resultObj
}

/**
 * 抽奖
 */
async function doLottery(taskId) {
    // const params = `reqUrl=act${actCode}&method=doLottery&operType=1&actCode=${actCode}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'doLottery')
    params.taskId = taskId
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }

    console.log(`抽奖成功，获得奖励：${ret.prizeLog}`)
    $.message += `抽奖成功，获得奖励：${ret.prizeLog}\n`

    await $.wait(2000)
}
