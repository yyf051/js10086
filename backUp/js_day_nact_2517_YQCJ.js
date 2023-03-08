const Env = require('./common/Env')
const {sendNotify} = require('./notice/SendNotify')
const {options, initCookie} = require('./common/01js10086_common')
const {nactFunc} = require('./common/01js10086_nact')

const $ = new Env('江苏移动_邀请抽奖')
!(async () => {
    $.message = ''
    for (let i = 0; i < options.length; i++) {
        // for (let i = 0; i < 1; i++) {
        await initCookie($, i)

        // $.isLog = true
        console.log($.phone)
        $.message += `<font size="5">${$.phone}</font>\n`
        await initIndexPage()

        console.log()
        $.message += `\n\n`
        await $.wait(10000)
    }

    console.log(`通知内容：\n\n`, $.message)
    await sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})


/**
 * 初始化页面
 */
async function initIndexPage() {
    const params = `reqUrl=act2517&method=initIndexPage&operType=1&actCode=2517&extendParams=&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, params)
    if (!ret) {
        return
    } else if (ret.info == '-2517007') {
        console.log(`已经参与过活动~`)
        $.message += `已经参与过活动~\n`
        return
    } else if (ret.info == '-2517008') {
        await $.wait(2000)

        await toDrawPrize()
    }
}

async function toDrawPrize() {
    const params = `reqUrl=act2517&method=toDrawPrize&operType=3&actCode=2517&extendParams=&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, params)
    if (!ret) {
        return
    }

    const awardCode = ret.awardCode
    let prizeName = ""
    if (awardCode == "GIFT_HF_2517_01") {
        prizeName = "0.1元话费"
    } else if (awardCode == "GIFT_HF_2517_02") {
        prizeName = "1元话费"
    } else if (awardCode == "GIFT_LL_2517_03") {
        prizeName = "588MB通用流量"
    } else if (awardCode == "GIFT_LL_2517_04") {
        prizeName = "1024MB通用流量"
    } else if (awardCode == "GIFT_LL_2517_05") {
        prizeName = "288MB通用流量"
    }
    if (awardCode) {
        console.log(`抽奖成功，获得${prizeName}`)
        $.message += `抽奖成功，获得${prizeName}\n`
    } else {
        console.log(`抽奖失败，${JSON.stringify(ret)}`)
        $.message += `抽奖失败，${JSON.stringify(ret)}\n`
    }

    await $.wait(2000)
}