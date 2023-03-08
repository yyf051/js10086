const Env = require('./common/Env')
const {sendNotify} = require('./notice/SendNotify')
const $ = new Env('江苏移动_网络加速，守“虎”美好')

const {
    ua, options, enter, recall, getExtendCookie1, getExtendCookie2, getExtendCookie3, getCookie, setConstCookie
} = $.isNode() ? require('./common/01js10086_common') : ''

$.message = ''
$.setCookie = ''
!(async () => {
    for (let i = 0; i < options.length; i++) {
        $.index = i
        const phone = `账号${options[i].headers['LC-PN']}`
        $.message += `${phone}: \n`
        console.log(`${phone}获取JSESSIONID......`)
        $.setCookie = await recall()
        console.log(`${phone}获取Cookie......`)
        const cks = await Promise.all([
            getCookie(options[i], $.setCookie),
            getExtendCookie3($.setCookie)
        ])
        $.setCookie += cks.join('')

        $.setCookie += setConstCookie();
        console.log(`${phone}获取活动信息......`)
        let r = await queryTaskMain()
        if (typeof r == 'object') {
            for (let j = 0; j < r.length; j++) {
                const task = r[j]
                if (task.taskType == 'BROWSE') {
                    const billNo = await doTask(task)
                    const billNo2 = await doneBrowseTask(task, billNo)
                    $.message += `\n`
                    await $.wait(2000)
                }
            }
            r = await queryTaskMain()
            for (var j = 0; j < r; j++) {
                await lotteryStrengthen()
                await $.wait(2000)
            }
        } else {
            for (var j = 0; j < r; j++) {
                await lotteryStrengthen()
                await $.wait(2000)
            }
        }


        console.log()
        $.message += `\n`
    }
    await sendNotify($.name, $.message)
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done()
})

/**
 * 查询活动信息
 */
function answer() {
    return new Promise((resolve, reject) => {
        const options = {
            'url': 'https://wap.js.10086.cn/mb_nact/new/microform//formview',
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept-Encoding': 'br, gzip, deflate',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'Referer': 'https://wap.js.10086.cn/',
                'Accept-Language': 'en-us',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': $.setCookie,
                'User-Agent': ua[$.index]
            }
        }
        $.get(options, async (err, resp, data) => {
            // console.log(`queryTaskMain: ${data}`)
            if (err) throw new Error(err)
            data = JSON.parse(data)
            // if (!data.success && data.code == '2') {
            //   $.message += `${data.message};\n`
            // }
            let subTaskList = []
            if (data.success && data.code == '1' && data.data) {
                subTaskList = data.data.taskSubList.filter(e => e.currentDoneCount == 0)
                if (subTaskList.length > 0) {
                    $.message += `查询可完成任务数：${subTaskList.length}\n`
                    console.log(`查询可完成任务数：${subTaskList.length}\n`)
                } else {
                    subTaskList = data.data.entitleCount
                }
            }
            resolve(subTaskList)
        })
    })
}

/**
 * 签到
 */
function doTask(task) {
    return new Promise((resolve, reject) => {
        const options = {
            'url': `https://wap.js.10086.cn/mb_nact/new/yxwap/doTask?actNum=RWCJ00000080&configNum=${task.configNum}&taskType=${task.taskType}`,
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept-Encoding': 'br, gzip, deflate',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'Referer': 'https://wap.js.10086.cn/',
                'Accept-Language': 'en-us',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': $.setCookie,
                'User-Agent': ua[$.index]
            },
            'body': `actNum=RWCJ00000080&configNum=${task.configNum}&taskType=${task.taskType}&_t=${(new Date()).getTime()}`
        }
        // console.log(JSON.stringify(options))
        $.post(options, async (err, resp, data) => {
            if (err) throw new Error(err)
            // console.log('doTask: ' + data)
            data = JSON.parse(data)
            let ret = ''
            if (data && data.success && data.code == '1' && data.data) {
                ret = data.data
                $.message += `开始执行任务: ${task.taskName}\n`
                console.log(`开始执行任务: ${task.taskName}\n`)
            }
            resolve(ret)
        })
    })
}


function doneBrowseTask(task, billNo) {
    return new Promise((resolve, reject) => {
        const options = {
            'url': `https://wap.js.10086.cn/mb_nact/new/yxwap/doneBrowseTask?actNum=RWCJ00000080&billNum=${billNo}`,
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept-Encoding': 'br, gzip, deflate',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'Referer': 'https://wap.js.10086.cn/',
                'Accept-Language': 'en-us',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': $.setCookie,
                'User-Agent': ua[$.index]
            },
            'body': `actNum=RWCJ00000111&billNum=${billNo}&_t=${(new Date()).getTime()}`
        }
        $.post(options, async (err, resp, data) => {
            if (err) throw new Error(err)
            // console.log('doneBrowseTask: ' + data)
            data = JSON.parse(data)
            let ret = ''
            if (data && data.success && data.code == '1' && data.data) {
                $.message += `成功执行任务: ${task.taskName}\n`
                console.log(`成功执行任务: ${task.taskName}\n`)
                ret = data.data
            }
            resolve(ret)
        })
    })
}

/**
 * 签到
 */
function lotteryStrengthen() {
    return new Promise((resolve, reject) => {
        const options = {
            'url': `https://wap.js.10086.cn/mb_nact/new/yxwap/lotteryStrengthen?actNum=RWCJ00000080&sourcesNum=H5&featureCode=&_t=${(new Date()).getTime()}`,
            'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept-Encoding': 'br, gzip, deflate',
                'Connection': 'keep-alive',
                'Accept': '*/*',
                'Referer': 'https://wap.js.10086.cn/',
                'Accept-Language': 'en-us',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': $.setCookie,
                'User-Agent': ua[$.index]
            }
        }
        $.get(options, async (err, resp, data) => {
            if (err) throw new Error(err)
            // console.log('lotteryStrengthen: ' + data)
            data = JSON.parse(data)
            if (data && data.success && data.code == '1' && data.data) {
                $.message += `获得${data.data.prize_name};\n`
                console.log(`获得${data.data.prize_name};\n`)
            } else if (data && data.success) {
                $.message += `获得失败，${data.message};\n`
                console.log(`获得失败，${data.message};\n`)
            } else {
                console.log('请求失败：', JSON.stringify(data))
            }
            resolve()
        })
    })
}