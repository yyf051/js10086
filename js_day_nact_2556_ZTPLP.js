/*
http://wap.js.10086.cn/nact/resource/2556/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_拆漂流瓶
cron:25 43 10 5 * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const { nactFunc, getNactParams } = require('./app/appNact')

const $ = new Env('江苏移动_拆漂流瓶')
const actCode = '2556'
const MAX_THROW_COUNT = 10

const js10086 = require('./app/js10086')
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
        $.setCookie = await getMobieCK($.phone, bodyParam)

        await execActivity()

        $.message += `\n`
        console.log(`---------------------------------------------------------\n`)
        await $.wait(20000)
    }

    console.log(`通知内容：\n\n`, $.message)
    await $.sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})

/**
 * 开始处理
 */
async function execActivity() {
    $.isLog = false
    $.isDirectReturnResultObj = true
    let resultObj = await initIndexPage()
    // await throwBottle(resultObj)
    
    // resultObj = await initIndexPage()
    await flashingBottle(resultObj)
}

/**
 * 初始化页面
 */
async function initIndexPage() {
    let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'))
    if (!resultObj) {
        throw Error('初始化活动失败...')
    }
    return resultObj
}

/**
 * 捞瓶子
 */
async function flashingBottle(resultObj) {
    const userDayChance = resultObj.userDayChance || {}
    const surplusChance = userDayChance.surplusChance || 5
    const fishingChance = userDayChance.fishingChance || 0
    const left = surplusChance - fishingChance
    console.log(`当前剩余${left}次机会, 进行捞瓶子...`)

    const params = getNactParams(actCode, 'flashingBottle')
    
    for (let index = 0; index < left; index++) {
        console.log(`开始捞瓶子...`)
        const ret = await nactFunc($, params)
        if (ret.userFlashingBottle != '10000000000') {
            console.log(`捞到的不是系统瓶，删除瓶子`)
            await delBottleRedis(ret.userFlashingBottle)
        } else {
            await openBottle(ret.userFlashingBottle)
        }

        await $.wait(5000)
    }
}

async function delBottleRedis(bottleUUID) {
    const params = getNactParams(actCode, 'delBottleRedis')
    params.bottleUUID = bottleUUID
    await nactFunc($, params)
    await $.wait(3000)
}

/**
 * 开瓶子
 */
async function openBottle(bottleUUID) {
    const params = getNactParams(actCode, 'openBottle')
    params.bottleUUID = bottleUUID
    const ret = await nactFunc($, params)
    
    console.log(`开瓶成功，奖励: ${ret.userBottleGift}`)
    $.message += `开瓶成功，奖励: ${ret.userBottleGift}\n`
    await $.wait(5000)
}

/**
 * 扔瓶子
 * @param {} resultObj 
 */
async function throwBottle(resultObj) {
    const userDayChance = resultObj.userDayChance || {}
    
    const params = getNactParams(actCode, 'throwBottle')
    params.bottleType = 1
    params.bottleMsg = encodeURIComponent(`团团圆圆新年到,欢欢喜喜迎新年,开开心心好运来。`)
    params.bottleGift = null
    
    const throwChance = userDayChance.throwChance || 0
    const left = MAX_THROW_COUNT - throwChance

    for (let index = 0; index < left; index++) {
        await nactFunc($, params)
        await $.wait(8000)
    }
    console.log(`完成扔漂流瓶...`)

}