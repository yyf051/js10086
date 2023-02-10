const Env = require('./function/Env')
const { options, encryptedPhone, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_签到组队')

!(async () => {
  $.message = ''
  for (let i = 0; i < options.length; i++) {
    $.index = i
    await initCookie($, i)

    await initIndexFunny()

    await $.wait(10000)
    console.log()
    $.message += `\n`
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch(async (e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  await $.sendNotify($.name, "签到失败，手动检查...")
}).finally(() => {
  $.done()
})

/**
 * 趣味签到
 * 组团签到：25号进行组团，1,2  1,3  1,4  2,1  2,5
 */
async function initIndexFunny() {
  await $.wait(2000)
  const params = 'reqUrl=act2510&method=initIndexFunny&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen='
  const resultObj = await nactFunc($, params)
  if (resultObj) {
    if (!resultObj.isInTeam && !resultObj.funnyInvitedInfo && $.teamUUID == '') {
      if ($.index <= 1) {
        $.message += '尚未加入队伍，创建队伍~\n'
        console.log(`${$.phone}尚未加入队伍，创建队伍~`)
        await createTeam() // 仅第一个人进行队伍创建，并逐次邀请第2、3、4人加团
      }
    } else if (!resultObj.isInTeam && resultObj.funnyInvitedInfo) {
      $.message += '尚未加入队伍，加入队伍~\n'
      console.log(`${$.phone}尚未加入队伍，加入队伍~`)
      await joinTeam()
    } else if (resultObj.isInTeam && resultObj.funnyTeamInfo) {
      const teamId = resultObj.funnyTeamInfo.teamId
      $.message += `已加入队伍，队伍ID=${teamId}~\n`
      console.log(`${$.phone}已加入队伍，队伍ID=${teamId}~\n`)
      if (resultObj.funnyTeamInfo.teamSignCnt >= 50) {
        $.message += `组团任务已完成，进行抽奖~\n`
        console.log(`${$.phone}组团任务已完成，进行抽奖~\n`)
        await teamReceiveAward(teamId)
      }
    }
  }
}


$.teamUUID = ''
/**
 * 创建或加入team
 */
async function createTeam() {
  if ($.teamUUID != '') {
    return
  }  
  await $.wait(2000)
  $.isDirectReturnResultObj = true
  const params = 'reqUrl=act2510&method=teamCreate&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen='
  const resultObj = await nactFunc($, params)

  if (resultObj && resultObj.funnyTeamInfo) {
    $.teamUUID = resultObj.funnyTeamInfo.teamId
    console.log(`${$.phone}创建队伍${$.teamUUID}成功......`)
    // 1逐次邀请2,3,4或者2逐次邀请1,5，直到邀请成功
    if ($.index == 0) {
      for (let i = 1; i < 4; i++) {
        const invitation = await teamSendInvitation($.teamUUID, encryptedPhone[i])
        if (invitation.errorCode == "-251090000") {
          console.log(`${$.phone}组员1邀请${i+1}号组员成功~`)
          break
        }
      }
    } else if ($.index == 1) {
      const invitation = await teamSendInvitation($.teamUUID, encryptedPhone[0])
      if (invitation.errorCode == "-251090000") {
        console.log(`${$.phone}组员2邀请1号组员成功~`)
      } else {
        const invitation2 = await teamSendInvitation($.teamUUID, encryptedPhone[0])
        if (invitation2.errorCode == "-251090000") {
          console.log(`${$.phone}组员2邀请5号组员成功~`)
        }
      }
    }
  } else {
    console.log(`${$.phone}创建队伍失败......`)
  }
  $.isDirectReturnResultObj = false
}


/**
 * 创建或加入team
 */
async function joinTeam(teamId) {
  if ($.teamUUID == '') {
    return
  }
  // 加入队伍  
  await $.wait(1000)
  const params = `reqUrl=act2510&method=teamDealInvitation&operType=1&actCode=2510&teamId=${teamId}&oprType=1&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)

  console.log(`${$.phone}加入队伍${teamId}成功......`)
}


/**
 * 邀请
 */
async function teamSendInvitation (teamId, friendMobile) {
  await $.wait(1000)
  $.isDirectReturnResultObj = true
  const params = `reqUrl=act2510&method=teamSendInvitation&operType=1&actCode=2510&teamId=${teamId}&friendMobile=${friendMobile}&extendParams=teamId%3D${teamId}&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  $.message += `邀请好友加团成功~\n`
  console.log(`${$.phone}邀请好友加团成功~\n`)

  $.isDirectReturnResultObj = false

  return resultObj
}


/**
 * 领奖
 */
async function teamReceiveAward (teamId) {
  await $.wait(1000)
  const params = `reqUrl=act2510&method=teamReceiveAward&operType=1&actCode=2510&teamId=${teamId}&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  $.message += `组团任务抽奖成功~\n`
  console.log(`${$.phone}组团任务抽奖成功~\n`)
}


/**
 * 查询组队历史，计算当前已组队次数
 */
async function teamLogHistory(teamId) {
  await $.wait(1000)
  const params = `reqUrl=act2510&method=teamQryMyTeams&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  console.log(`${$.phone}查询组团历史成功~\n`)
}