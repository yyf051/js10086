/*
http://wap.js.10086.cn/nact/resource/2468/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_领红包送亲友
cron:25 1 12 1-10 * *
*/
const Env = require('./common/Env')
const {getMobileCK} = require('./app/appLogin')
const {sendNotify} = require('./notice/SendNotify')
const {nactFunc, getNactParams} = require('./app/appNact')

const redis = require("ioredis")
const config = require('./conf/globalConfig').redisConfig
const initCache = require('./common/Cache')
const MONTH_KEY = 'JS10086_LHBSQY_MONTH_COUNT'
const DAY_KEY = 'JS10086_LHBSQY_DAY_COUNT'

const $ = new Env('江苏移动_领红包送亲友')
const actCode = '2468'

const js10086 = require('./app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
    cookiesArr.push(js10086[item])
})

let exec = true

!(async () => {
    $.message = ''
    for (let i = 0; i < cookiesArr.length; i++) {
        if (!exec) {
            // 不再执行
            break
        }

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

        $.isLog = true
        await initIndexPage()

        console.log()
        $.message += `\n`
        console.log(`---------------------------------------------------------\n`)
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
 * {
      "isLogin": true,
      "cityNo": "20",
      "mobile": "138****3702",
      "isApp": true,
       "remainCount": 3, // 可拆红包数量，每次拆（doLottery）后，需要先分享并领取才能继续拆
      "toLottery": true
    }

 // 拆红包后，未被领取时，存在error，因此需要直接返回resultObj
 "resultMsg": "用户当前有红包未送出",
 "resultObj": {
        "isLogin": true,
        "cityNo": "20",
        "mobile": "138****3702",
        "errorCode": "-2468010",
        "isApp": true,
        "remainCount": 2
    }
 */
async function initIndexPage() {
    $.isDirectReturnResultObj = true
    let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'), true)
    $.isDirectReturnResultObj = false
    if (!resultObj) {
        return
    }
    if (resultObj.errorCode == '-2468010') {
        // console.log(``)
        const receiveRet = await receiveGift()
        if (!receiveRet) {
            console.log(`领取失败，该账号无法继续拆红包分享`)
            return
        }
    } else if (resultObj.errorCode == '-2468006') {
        console.log(`当天已赠送了3次红包，明日再来～`)
        $.message += `当天已赠送了3次红包，明日再来～\n`
        return
    }

    const remainCount = resultObj.remainCount
    if (remainCount > 0) {
        for (let i = 0; i < remainCount; i++) {
            const shareId = await doLottery()
            const receiveRet = await receiveGift(shareId)
            if (!receiveRet) {
                console.log(`领取失败，该账号无法继续拆红包分享`)
                return
            }
        }
    } else {
        console.log(`无可拆红包，明日再来～`)
        $.message += `无可拆红包，明日再来～\n`
    }

}

/**
 * 分享给亲友，每人每天最多可赠送3次，每月赠送无限制
 */
async function shareToFriends() {
    // `reqUrl=act${actCode}&method=shareToFriends&operType=1&actCode=${actCode}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'shareToFriends')
    params.shareType = 'qrCode2'
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }
    await $.wait(2000)
    return ret.shareId
}

/**
 * 分享给亲友，每人每天最多可赠送3次，每月赠送无限制
 */
async function initSharePage(vm, shareId) {
    // `reqUrl=act${actCode}&method=initSharePage&operType=1&actCode=${actCode}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'initSharePage')
    params.shareId = shareId
    const ret = await nactFunc(vm, params)

    if (!ret) {
        return
    }
    await vm.wait(2000)
    return true
}

/**
 * 亲友领取，每人每天只能领取1次，每月最多领取10次
 * Redis 记录每个人当日是否领取，每月领取数量
 */
async function receiveGift(shareId) {

    // 查找可分享的亲友
    const account = await getReceiveAccount()
    if (!account) {
        // 未找到可领取账号，结束。
        return
    }

    if (!shareId) {
        // 未传shareId，分享给亲友
        shareId = await shareToFriends()
    }

    if (!shareId) {
        console.log(`未传递shareId，结束领取`)
        return
    }
    const vmx = Object.assign(new Env('领取奖励'), account)
    vmx.isLog = true
    console.log(`环境信息： ${vmx.phone}`)

    const initShareRet = await initSharePage(vmx, shareId)
    if (!initShareRet) {
        console.log(`初始化分享失败，不再执行`)
        return
    }


    // `reqUrl=act${actCode}&method=receiveGift&operType=1&actCode=${actCode}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'receiveGift')
    params.shareId = shareId
    vmx.isDirectReturnResultObj = true
    const ret = await nactFunc(vmx, params)
    vmx.isDirectReturnResultObj = false

    if (!ret) {
        return
    }

    // 记录redis
    await logReceiveCount(account.phone)

    await $.wait(3000)
    if (ret.errorCode == '-2468011') {
        console.log(`${vmx.phone}今日已领取过红包`)
        $.message += `${vmx.phone}今日已领取过红包\n`
        // 未能领取成功，重新领取
        console.log(`继续查找可领取的用户...`)
        return await receiveGift(shareId)
    } else {
        console.log(`领取成功，${vmx.phone}获得奖励：${ret.awardName}`)
        $.message += `领取成功，${vmx.phone}获得奖励：${ret.awardName}\n`
    }
    return true
}

/**
 * 获取可领取的账号，若没有，则表示今日所有账号均已领取，不再执行
 */
async function getReceiveAccount() {
    const ret = {}
    for (let i = 0; i < cookiesArr.length; i++) {
        const ck = cookiesArr[i]
        const phone = decodeURIComponent(ck.match(/phone=([^; ]+)(?=;?)/) && ck.match(/phone=([^; ]+)(?=;?)/)[1])
        if (phone == $.phone) {
            // 自己，跳过
            console.log(`当前查找到的是自己：${phone}，跳过`)
            continue
        }

        // 检查该手机号当月领取次数；检查今日是否领取过
        const targetPhoneCanReceive = await checkPhonePermission(phone)
        if (!targetPhoneCanReceive) {
            // 检查未通过，跳过
            continue
        }

        const bodyParam = decodeURIComponent(ck.match(/body=([^; ]+)(?=;?)/) && ck.match(/body=([^; ]+)(?=;?)/)[1])
        const setCookie = await getMobileCK(phone, bodyParam)
        ret.phone = phone
        ret.setCookie = setCookie
        break
    }

    const result = ret.hasOwnProperty('phone') ? ret : false
    if (!result) {
        // 检查下自己是否已经领取过
        const currentPhoneCanReceive = await checkPhonePermission($.phone)
        if (!currentPhoneCanReceive) {
            // 记录不要继续执行了，每人可以领奖励了。
            $.message += `当日所有账号均已领取过，不再执行\n`
            console.log(`当日所有账号均已领取过，不再执行`)
            exec = false
        }
    } else {
        console.log(`查找到的可领取的手机号：${ret.phone}`)
    }
    return result
}

/**
 * 检查该手机号当月领取次数；检查今日是否领取过
 */
async function checkPhonePermission(phone) {
    const client = redis.createClient(config)
    try {
        const cache = initCache(client)
        const receiveCountMonth = await cache.hget(MONTH_KEY, phone)
        const receiveCountToday = await cache.hget(DAY_KEY, phone)
        if (receiveCountMonth >= 10 || receiveCountToday >= 1) {
            console.log(`${phone}已达领取上限，month=${receiveCountMonth}，day=${receiveCountToday}`)
            return false
        }
        return true
    } catch (e) {
        console.error(e)
    } finally {
        client.quit()
    }

    return false
}

/**
 * 记录领取数量
 */
async function logReceiveCount(phone) {
    const client = redis.createClient(config)
    try {
        const cache = initCache(client)

        // 设置key及过期时间
        const monthKeyExists = await cache.exists(MONTH_KEY)
        if (!monthKeyExists) {
            await cache.expire(MONTH_KEY, 27 * 24 * 60 * 60)
        }
        const dayKeyExists = await cache.exists(DAY_KEY)
        if (!dayKeyExists) {
            await cache.expire(DAY_KEY, 23 * 60 * 60)
        }

        // 获取key
        const receiveCountMonth = await cache.hget(MONTH_KEY, phone)
        const receiveCountToday = await cache.hget(DAY_KEY, phone)
        // 设置reids
        if (receiveCountToday < 1) {
            // 今日未记录过，则记录
            await cache.hset(MONTH_KEY, phone, receiveCountMonth + 1)
            await cache.hset(DAY_KEY, phone, 1)
            console.log(`${phone}更新redis，month=${receiveCountMonth + 1}，day=1`)
        } else {
            console.log(`${phone}更新redis，month=${receiveCountMonth}，day=${receiveCountToday}`)
        }

    } catch (e) {
        console.error(e)
    } finally {
        client.quit()
    }
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

    console.log(`拆红包成功：${ret.awardName}`)
    $.message += `拆红包成功：${ret.awardName}\n`

    await $.wait(2000)

    return ret.shareId
}
