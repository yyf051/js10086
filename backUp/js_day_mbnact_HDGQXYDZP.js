/*
http://wap.js.10086.cn/mb_nact/new/act-front/cj/cj020/main.html?actNum=7000152043gnqwc&rm=ydc
江苏移动_欢度佳节幸运大转盘
cron:10 20 10 1-7 10 ?
*/
const Env = require('../common/Env')
const {sendNotify} = require('../notice/SendNotify')
const {getMobileCK} = require('../app/appLogin')
const {mbactFunc} = require('../app/appMbnact')

const $ = new Env('江苏移动_欢度佳节幸运大转盘')

const js10086 = require('../app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
    cookiesArr.push(js10086[item])
})

!(async () => {
    $.message = ''
    for (let i = 0; i < cookiesArr.length; i++) {
        const cookie = cookiesArr[i]
        $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
        const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])

        $.message += `<font size="5">${$.phone}</font>\n`
        // console.log(`env: ${$.phone}, ${bodyParam}`)
        if (!$.phone || !bodyParam) {
            $.message += `登陆参数配置不正确\n`
            continue
        }

        console.log(`${$.phone}获取Cookie：`)
        $.setCookie = await getMobileCK($.phone, bodyParam)

        console.log(`${$.phone}检查参与状态......`)
        const initRet = await mbactFunc($, 'checkEntitleAccount', '7000152043gnqwc8')
        if (!initRet) {
            continue
        }
        if (initRet.surplusCount === 0) {
            $.message += `无抽奖机会\n`
            console.log(`${$.phone}无抽奖机会`)
            continue
        }
        for (let j = 0; j < initRet.surplusCount; j++) {
            const checkCanLottery = await mbactFunc($, 'checkCanLottery', '7000152043gnqwc8')
            if (!checkCanLottery) {
                continue
            }
            await $.wait(1000)

            const lotteryStrengthen = await mbactFunc($, 'lotteryStrengthen', '7000152043gnqwc8&sourcesNum=H5&featureCode=')
            if (!lotteryStrengthen) {
                continue
            }
            $.message += `赢得${lotteryStrengthen.prize_name}\n`
            console.log(`赢得${lotteryStrengthen.prize_name}\n`)
            await $.wait(2000)
        }

        console.log()
        $.message += `\n`
        await $.wait(5000)
    }
    console.log(`通知内容：\n\n`, $.message)
    await sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})