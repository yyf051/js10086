/*
http://wap.js.10086.cn/nact/resource/2539/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_攒油兑好礼
cron:25 35 10 * * *
*/

const Env = require('./common/Env')
const {sendNotify} = require('./notice/SendNotify')
const {getMobileCK} = require('./app/appLogin')
const {nactFunc, getNactParams} = require('./app/appNact')

const $ = new Env('江苏移动_攒油兑好礼')
const actCode = '2539'

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
        $.setCookie = await getMobileCK($.phone, bodyParam)

        // $.isLog = true
        await initIndexPage()

        console.log()
        $.message += `\n`
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
    // const params = `reqUrl=act2539&method=initIndexPage&operType=1&actCode=2539&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, getNactParams(actCode, 'initIndexPage'))
    if (!ret) {
        return
    }

    const isSign = ret.isSign
    if (!isSign) {
        await checkSign()
    } else {
        console.log(`今日已签到`)
        // $.message += `今日已签到\n`
    }
    let finishTaskIds = ['1']
    const tasks = ret.doTaskList || []
    finishTaskIds = finishTaskIds.concat(tasks.flatMap(e => e.source))

    // console.log(finishTaskIds, ret.taskList)

    await execTasks(ret.taskList, finishTaskIds)

    await $.wait(2000)

    await getOils()
}

async function getOils() {
    // const params = `reqUrl=act2539&method=initIndexPage&operType=1&actCode=2539&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, getNactParams(actCode, 'initIndexPage'))
    if (!ret) {
        return
    }

    $.myOil = Number.parseInt(ret.myOil)
    const oilList = ret.oilList
    if (oilList && oilList.length > 0) {
        console.log(`存在油滴${oilList.length}个，进行获取`)
        // $.message += `存在油滴${oilList.length}个，进行获取\n`
        for (let i = 0; i < oilList.length; i++) {
            await getTemporaryOil(oilList[i].oil, oilList[i].getType)
        }
    }
    console.log(`当前总油滴${$.myOil}个`)
    $.message += `当前总油滴${$.myOil}个\n`

    // 2元话费要求1800
    if ($.myOil >= 1800) {
        console.log(`准备兑换...`)
        await initGetPrizePage()
    }
}


/**
 * 检查打卡
 */
async function checkSign() {
    await doTask(1, '每天签到领油')
}


/**
 * 执行任务
 */
async function execTasks(taskList, finishTaskIds) {
    if (finishTaskIds.length == taskList.length) {
        console.log(`今日任务均已完成，无需执行`)
        $.message += `今日任务均已完成，无需执行\n`
    }
    // console.log(finishTaskIds)
    for (let i = 0; i < taskList.length; i++) {
        const task = taskList[i]
        // console.log(task)
        if (finishTaskIds.indexOf(task.taskId) > -1) {
            continue
        }
        await doTask(task.taskId, task.taskName)
    }
}


/**
 * 完成任务
 */
async function doTask(taskId, taskName) {
    // const params = `reqUrl=act2539&method=doTask&operType=1&actCode=2539&taskId=${taskId}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'doTask')
    params.taskId = taskId
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }

    console.log(`已完成任务：${taskName}`)
    // $.message += `已完成任务：${taskName}\n`
    await $.wait(5000)
}


/**
 * 抽奖
 */
async function getTemporaryOil(oil, getType) {
    // const params = `reqUrl=act2539&method=getTemporaryOil&operType=1&actCode=2539&getType=${getType}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'getTemporaryOil')
    params.getType = getType
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }

    $.myOil += Number.parseInt(oil)
    console.log(`领${oil}滴油成功`)
    $.message += `领${oil}滴油成功;`

    await $.wait(2000)
}

async function exchangePrize(prizeId) {
    // const params = `reqUrl=act2539&method=exchangePrize&operType=1&actCode=2539&prizeId=${prizeId}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'exchangePrize')
    params.prizeId = prizeId
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }

    // console.log(`执行结果： ${JSON.stringify(ret)}`)
    console.log(`兑换${ret.awardName}成功`)
    $.message += `兑换${ret.awardName}成功\n`
}


/**
 * 抽奖
 */
async function initGetPrizePage() {
    // const params = `reqUrl=act2539&method=initGetPrizePage&operType=1&actCode=2539&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'initGetPrizePage')
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }

    const myOil = ret.myOil
    const prizeConfig = ret.prizeConfig
    /*{
      "leftNumber": 0,
      "limit": "1",
      "month": "202301",
      "needOil": 1800,
      "order": "40",
      "poolId": "2563",
      "prizeId": "44",
      "prizeName": "2元话费",
      "value": "1"
    }*/
    let cfg
    for (let i = prizeConfig.length - 1; i >= 0; i--) {
        const config = prizeConfig[i]
        if (config.prizeId == 44 || config.prizeName.indexOf('话费') > -1) {
            cfg = config
            break
        }
    }

    await $.wait(2000)

    if (myOil >= cfg.needOil && cfg.leftNumber > 0) {
        // do exchange
        await exchangePrize(cfg.prizeId)
    }
}
