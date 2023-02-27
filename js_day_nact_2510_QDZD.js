/**
 * 趣味签到-组团签到：
 * 组队50天可领588M/588E豆，
 * 每个人每月3次创建队伍，每个人每月1次加入队伍的机会
 * 总共5个账号，每月10创建1次队伍或者每月17号创建2次队伍
 * cron:25 15 12 10 * * js_day_nact_2510_QDZD.js
 */
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const { nactFunc, getNactParams } = require('./app/appNact')

const $ = new Env('江苏移动_签到组队')
const js10086 = require('./app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
    cookiesArr.push(js10086[item])
})

const actCode = '2510'
const phone4CreateTeam = process.env.JS_10086_TEAM_PHONE || cookiesArr[0]

!(async () => {
    let cookie
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i]
        $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
        if (phone4CreateTeam.indexOf($.phone) > -1) {
            break
        }
    }
    if (!cookie) return
    const success = await login(cookie)
    if (!success) return

    await execActivity()

    console.log(`-------------------------------------------------------\n\n\n`)
    await $.wait(10000)

    console.log(`通知内容：\n\n`, $.message)
    await $.sendNotify($.name, $.message)
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
    $.isLog = true
    $.isDirectReturnResultObj = true

    let teamId
    let resultObj = await initIndexFunny()
    if (resultObj.isInTeam) {
        teamId = resultObj.funnyTeamInfo.teamId
    } else {
        const teamInfo = await teamCreate()
        teamId = teamInfo.funnyTeamInfo.teamId
    }
    if (!teamId) {
        console.log(`不存在队伍信息，结束`)
        return
    }

    console.log(`开始邀请好友加入队伍...`)
    // 邀请非自己
    for (let i = 0; i < cookiesArr.length; i++) {
        const cookie = cookiesArr[i]
        const phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
        if (phone === $.phone) continue
        const invitation = await teamSendInvitation(teamId, phone)
        if (invitation.errorCode == "-251090000") {
          console.log(`邀请${phone}成功~`)
        }
    }
    await $.wait($.randomWaitTime(2, 3))

    // 被邀请人逐个接受邀请
    console.log(`开始处理好友邀请`)
    let canReceived = false
    for (let i = 0; i < cookiesArr.length; i++) {
        const cookie = cookiesArr[i]
        const phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
        const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])
        if (phone === $.phone) continue

        const vmx = Object.assign(new Env('好友邀请'), {phone})
        vmx.isLog = true
        vmx.setCookie = await getMobieCK(phone, bodyParam)
        await initIndexFunny(vmx)
        const invitation = await teamDealInvitation(vmx, teamId)

        // 检查否是已达到50天
        resultObj = await initIndexFunny()
        if (resultObj.funnyTeamInfo.teamSignCnt >= 50) {
            canReceived = true
            break
        }
    }


    if (!canReceived) {
        return
    }
    await $.wait($.randomWaitTime(2, 3))
    console.log(`开始领取组队奖励`)
    for (let i = 0; i < cookiesArr.length; i++) {
        const cookie = cookiesArr[i]
        const phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
        const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])

        const vmx = Object.assign(new Env('领取奖励'), {phone})
        vmx.isLog = true
        vmx.setCookie = await getMobieCK(phone, bodyParam)
        await teamReceiveAward(vmx, teamId)
    }
    // special logic

}

/**
 * 趣味签到-组团签到
 */
async function initIndexFunny(vm) {
    vm = vm || $
    vm.wait(vm.randomWaitTime(2, 3))
    const params = getNactParams(actCode, arguments.callee.name)
    return await nactFunc(vm, params)
}


/**
 * 创建或加入team
 */
async function teamCreate() {
    await $.wait($.randomWaitTime(2, 3))
    const params = getNactParams(actCode, arguments.callee.name)
    return await nactFunc($, params)
}


/**
 * 创建或加入team
 */
async function teamDealInvitation(vm, teamId) {
    // 加入队伍  
    await vm.wait(vm.randomWaitTime(1, 2))
    // const params = `reqUrl=act2510&method=teamDealInvitation&operType=1&actCode=2510&teamId=${teamId}&oprType=1&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, arguments.callee.name, {teamId})
    return await nactFunc(vm, params)

    // console.log(`${vm.phone}加入队伍${teamId}成功......`)
}


/**
 * 邀请
 */
async function teamSendInvitation(teamId, friendMobile) {
    await $.wait($.randomWaitTime(1, 2))
    // const params = `reqUrl=act2510&method=teamSendInvitation&operType=1&actCode=2510&teamId=${teamId}&friendMobile=${friendMobile}&extendParams=teamId%3D${teamId}&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, arguments.callee.name, {teamId, friendMobile})
    return await nactFunc($, params)
}


/**
 * 领奖
 */
async function teamReceiveAward(vm, teamId) {
    await vm.wait(vm.randomWaitTime(1, 2))
    // const params = `reqUrl=act2510&method=teamReceiveAward&operType=1&actCode=2510&teamId=${teamId}&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, arguments.callee.name, {teamId})
    return await nactFunc(vm || $, params)
}


/**
 * 查询组队历史，计算当前已组队次数
 */
async function teamQryMyTeams() {
    await $.wait($.randomWaitTime(1, 2))
    // const params = `reqUrl=act2510&method=teamQryMyTeams&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen=`
    const params = getNactParams(actCode, arguments.callee.name)
    return await nactFunc($, params)
    console.log(`${$.phone}查询组团历史成功~\n`)
}