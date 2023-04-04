/**
 * https://wap.js.10086.cn/mb_nact/new/act-front/rwcj/rwcj002/main.html?actNum=RWCJ00015049&rm=ydc&shareToken=dQEWCORLKHrkeV2QtW/TUg==
 * cron:
 */
const Env = require('./common/Env')
const {sendNotify} = require('./notice/SendNotify')
const {getMobileCK} = require('./app/appLogin')
const {mbactFunc} = require('./app/appMbnact')

const $ = new Env('江苏移动_暖暖春日')
const actionNum = 'RWCJ00015049'

!(async () => {
    $.message = ''
    for (let i = 0; i < options.length; i++) {
        const cookie = cookiesArr[i]
        $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
        const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])

        $.message += `<font size="5">${$.phone}</font>\n`
        if (!$.phone || !bodyParam) {
            $.message += `登陆参数配置不正确\n`
            continue
        }

        console.log(`${$.phone}获取Cookie：`)
        $.setCookie = await getMobileCK($.phone, bodyParam)

        let resultObj = await queryTaskMain()
        if (!resultObj) {
            continue
        }

        // "doneCount": 2,
        // "limitCount": 3,
        if (resultObj.entitleCount > 0) {
            entitleCount = resultObj.entitleCount
            for (var j = 0; j < entitleCount; j++) {
                await lotteryStrengthen()
                await $.wait(2000)
            }
        } else {
            const subTaskList = resultObj.taskSubList.filter(e => e.currentDoneCount === 0).slice(0, 5)
            if (subTaskList.length > 0) {
                $.message += `查询可完成任务数：${subTaskList.length}\n`
                console.log(`${$.phone}查询可完成任务数：${subTaskList.length}\n`)
                for (let j = 0; j < subTaskList.length; j++) {
                    const task = subTaskList[j]
                    if (task.taskType === 'BROWSE') {
                        const billNo = await doTask(task)
                        const billNo2 = await doneBrowseTask(task, billNo)
                        $.message += `\n`
                        await $.wait(2000)

                        await lotteryStrengthen()
                    }
                }
            } else {
                $.message += `今日已完成，无任务可做\n`
                console.log(`${$.phone}今日已完成，无任务可做`)
            }
        }

        console.log()
        $.message += `\n\n`
    }
    console.log(`通知内容：\n\n`, $.message)
    await sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})

/**
 * 查询活动信息
 */
async function queryTaskMain() {
    console.log(`${$.phone}查询任务信息......`)
    return await mbactFunc($, 'queryTaskMain', actionNum)
}

/**
 * 执行任务
 */
async function doTask(task) {
    console.log(`${$.phone}执行任务${task.taskName}......`)
    const actNum = `${actionNum}&configNum=${task.configNum}&taskType=${task.taskType}`
    const body = `actNum=${actionNum}&configNum=${task.configNum}&taskType=${task.taskType}`
    return await mbactFunc($, 'doTask', actNum, body)
}

/**
 * 完成任务
 */
async function doneBrowseTask(task, billNo) {
    console.log(`${$.phone}成功执行任务: ${task.taskName}......`)
    const actNum = `${actionNum}&billNum=${billNo}`
    const body = `actNum=${actionNum}&billNum=${billNo}`
    $.message += `成功执行任务: ${task.taskName}\n`
    return await mbactFunc($, 'doneBrowseTask', actNum, body)
}

/**
 * 抽奖
 */
async function lotteryStrengthen() {
    const resultObj = await mbactFunc($, 'lotteryStrengthen', `${actionNum}&sourcesNum=H5&featureCode=`)
    if (resultObj && resultObj.prize_name) {
        $.message += `赢得${resultObj.prize_name}\n`
        console.log(`${$.phone}赢得${resultObj.prize_name}`)
    }
}