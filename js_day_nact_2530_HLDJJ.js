/*
http://wap.js.10086.cn/nact/resource/2530/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_好礼大集结，天天有惊喜
cron:25 30 10 * * *
*/
const Env = require('./common/Env')
const {sendNotify} = require('./notice/SendNotify')
const {getMobileCK} = require('./app/appLogin')
const {nactFunc, getNactParams} = require('./app/appNact')

const $ = new Env('江苏移动_好礼大集结，天天有惊喜')
const actCode = '2530'

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
        $.isDirectReturnResultObj = true
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
    // const params = `reqUrl=act2530&method=initIndexPage&operType=1&actCode=2530&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, getNactParams(actCode, 'initIndexPage'))
    if (!ret) {
        return
    }

    if (ret.unReceiveSignRecord) {
        // 首次进入，超级抽奖
        console.log(`存在超级抽奖机会，进行超级抽奖`)
        await doSuperLottery()
    }

    const chance = ret.chance
    if (chance && chance > 0) {
        console.log(`存在抽奖${chance}机会，进行抽奖`)
        $.message += `存在抽奖${chance}机会，进行抽奖\n`
        for (let i = 0; i < chance; i++) {
            await doLottery()
        }
    }
    if (!ret.signRecordByToday) {
        await checkSign()
    }

    const tasks = ret.doTaskList || []
    const finishTaskIds = tasks.flatMap(e => e.taskId)

    await execTasks(ret.taskList, finishTaskIds)

    await $.wait(2000)
}


/**
 * 检查打卡
 */
async function checkSign() {

    await doTask(0, '今日打卡', 0)
}


/**
 * 执行任务
 */
async function execTasks(taskList, finishTaskIds) {
    if (finishTaskIds.length === taskList.length) {
        console.log(`今日任务均已完成，无需执行`)
        $.message += `今日任务均已完成，无需执行\n`
    }

    for (let i = 0; i < taskList.length; i++) {
        const task = taskList[i]
        if (finishTaskIds.indexOf(task.taskId) > -1) {
            continue
        }
        await doTask(task.taskId, task.taskName, task.type)
    }
}


/**
 * 完成任务
 */
async function doTask(taskId, taskName, taskType) {
    // const params = `reqUrl=act2530&method=doTask&operType=1&actCode=2530&taskId=${taskId}&taskType=${taskType}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, 'doTask');
    params.taskId = taskId
    params.taskType = taskType
    const ret = await nactFunc($, params)

    if (!ret) {
        return
    }

    console.log(`已完成任务：${taskName}，进行抽奖`)
    // $.message += `已完成任务：${taskName}，进行抽奖\n`
    await $.wait(5000)

    await doLottery()
}


/**
 * 抽奖
 */
async function doLottery() {
    // const params = `reqUrl=act2530&method=doLottery&operType=1&actCode=2530&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, getNactParams(actCode, 'doLottery'))

    if (!ret) {
        return
    }

    console.log(`抽奖成功，获得奖励：${ret.awardName}`)
    $.message += `抽奖成功，获得奖励：${ret.awardName}\n`

    await $.wait(2000)
}


/**
 * 超级抽奖
 */
async function doSuperLottery() {
    // const params = `reqUrl=act2530&method=doSuperLottery&operType=1&actCode=2530&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
    const ret = await nactFunc($, getNactParams(actCode, 'doSuperLottery'))

    if (!ret) {
        return
    }

    console.log(`超级抽奖成功，获得奖励：${ret.awardName}`)
    $.message += `超级抽奖成功，获得奖励：${ret.awardName}\n`

    await $.wait(2000)
}