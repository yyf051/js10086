/*
http://wap.js.10086.cn/nact/resource/2528/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_春暖花开享好礼
cron:25 43 7 * * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const { nactFunc, getNactParams } = require('./app/appNact')

const $ = new Env('江苏移动_春暖花开享好礼')
const actCode = '2528'
const MAX_SIGN_MONTH = 5 // 每月可签到天数
const MAX_SHARE_MONTH = 3 // 每月可分享次数
const WATER_NEED = 20 // 每次浇水所需水滴

const js10086 = require('./app/js10086')
const cookiesArr = []
Object.keys(js10086).forEach((item) => {
  cookiesArr.push(js10086[item])
})

!(async () => {
  $.msg = ''
  for (let i = 0; i < cookiesArr.length; i++) {
    const cookie = cookiesArr[i]
    $.phone = decodeURIComponent(cookie.match(/phone=([^; ]+)(?=;?)/) && cookie.match(/phone=([^; ]+)(?=;?)/)[1])
    const bodyParam = decodeURIComponent(cookie.match(/body=([^; ]+)(?=;?)/) && cookie.match(/body=([^; ]+)(?=;?)/)[1])
    
    $.msg += `<font size="5">${$.phone}</font>\n`
    // console.log(`env: ${$.phone}, ${bodyParam}`)
    if (!$.phone || !bodyParam) {
      $.msg += `登陆参数配置不正确\n`
      continue
    }

    console.log(`${$.phone}获取Cookie：`)
    $.setCookie = await getMobieCK($.phone, bodyParam)

    await execActivity()
    
    console.log()
    $.msg += `\n`
    console.log(`---------------------------------------------------------\n\n\n`)
    await $.wait(10000)
  }

  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
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
  
  await handleSign(resultObj)
  await handleShare(resultObj)
  await handleBrowser(resultObj)
  
  resultObj = await initIndexPage()
  const starLeft = resultObj.registerBean.starLeft
  await watering(starLeft)
  
  resultObj = await initIndexPage()
  await lottery(resultObj.registerBean)

}

/**
 * 初始化页面
 */
async function initIndexPage() {
  let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'), true)
  if (!resultObj) {
    throw Error('初始化活动失败...')
  }
  return resultObj
}

/**
 * 处理签到
 */
async function handleSign(resultObj) {
  const isSign = resultObj.isSign
  if (isSign) {
    console.log(`今日已签到...`)
    return
  }

  await doTask({taskId: 0, taskName: '签到', taskType: 0})
}

/**
 * 处理去分享
 */
async function handleShare(resultObj) {

  const shareS = resultObj.shareS ? resultObj.shareS.length : 0
  if (shareS >= MAX_SHARE_MONTH) {
    console.log(`当月已达到最大分享次数${MAX_SHARE_MONTH}`)
    return
  }

  // taskType: 1、分享，2、浏览，3、办理
  // status: 1、未完成
  const taskConfig = resultObj.taskConfig
  const tasks = taskConfig.filter(e => e.taskId == 1)
  if (!tasks || tasks.length == 0) {
    console.log(`未查找到分享任务...`)
    return
  }
  const task = tasks[0]

  const left = MAX_SHARE_MONTH - shareS
  for (let i = 0; i < left; i++) {
    await doTask(task)
  }
}

/**
 * 处理去浏览
 */
async function handleBrowser(resultObj) {

  // taskType: 1、分享，2、浏览，3、办理
  // status: 1、未完成
  const taskConfig = resultObj.taskConfig
  const tasks = taskConfig.filter(e => e.taskType == 2)
  if (!tasks || tasks.length == 0) {
    console.log(`未查找到浏览任务...`)
    return
  }

  const taskLogs = resultObj.taskLogs || []
  const finishTaskIds = taskLogs.filter(e => e.taskType == 2).flatMap(e => e.taskId)
  await execTasks(tasks, finishTaskIds)
}


/**
 * 执行任务
 */
async function execTasks(taskList, finishTaskIds) {
  if (finishTaskIds.length == taskList.length) {
    console.log(`今日任务均已完成，无需执行`)
    $.msg += `今日任务均已完成，无需执行\n`
    return
  }

  for (let i = 0; i < taskList.length; i++) {
    const task = taskList[i]
    if (finishTaskIds.indexOf(task.taskId) > -1) {
      continue
    }
    await doTask(task)
  }
}


/**
 * 完成任务
 */
async function doTask(task) {
  const params = getNactParams(actCode, 'doTask');
  params.taskId = task.taskId
  params.taskType = task.taskType
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  task = ret.taskConfig
  console.log(`已完成任务：${task.taskName}，获得${task.startCount || ' UNKNOWN '}水滴`)
  $.msg += `已完成任务：${task.taskName}，获得${task.startCount || ' UNKNOWN '}水滴\n`
  await $.wait(3000)
}

/**
 * 浇水
 */
async function watering(starLeft) {
  if (starLeft < WATER_NEED) {
    console.log(`水滴不足${WATER_NEED}, 结束浇水...`)
    $.msg += `水滴不足${WATER_NEED}, 结束浇水...\n`
    return
  }


  console.log(`开始浇水...`)
  const params = getNactParams(actCode, 'watering')
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  console.log(`浇水成功，剩余水滴：${ret.StarLeft}`)
  $.msg += `浇水成功，剩余水滴：${ret.StarLeft}\n`

  await $.wait(2000)
  watering(ret.StarLeft)
}

/**
 * 抽奖
 */
async function lottery(registerBean) {
  if (!registerBean) {
    return
  }
  const bigLeft = registerBean.bigLeft
  for (let i = 0; i < bigLeft; i++) {
    await doLottery(0)
  }
  const picecCount = registerBean.picecCount
  for (let i = 0; i < picecCount; i++) {
    await doLottery('big')
  }
}

/**
 * 抽奖
 */
async function doLottery(pieceId) {
  const params = getNactParams(actCode, 'doLottery')
  params.pieceId = pieceId  
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }
  if (ret.isWin) {
    // console.log(JSON.stringify(ret))
    console.log(`抽奖成功，获得奖励：${ret.prizeLog.awardName}`)
    $.msg += `抽奖成功，获得奖励：${ret.prizeLog.awardName}\n`
  }

  await $.wait(2000)
}
