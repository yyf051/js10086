/*
http://wap.js.10086.cn/nact/resource/2530/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_好礼大集结，天天有惊喜
cron:25 30 10 * * *
*/
const Env = require('./01Env')
const { options, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

const $ = new Env('江苏移动_好礼大集结，天天有惊喜')
!(async () => {
  $.message = ''
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    // $.isLog = true
    console.log($.phone)
    $.message += `<font size="5">${$.phone}</font>\n`
    await initIndexPage()
    
    console.log()
    $.message += `\n\n`
    await $.wait(10000)
  }

  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})


/**
 * 初始化页面
 */
async function initIndexPage() {
  const params = `reqUrl=act2530&method=initIndexPage&operType=1&actCode=2530&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  const chance = ret.chance
  if (chance && chance > 0) {
    console.log(`存在抽奖${chance}机会，进行抽奖`)
    $.message += `存在抽奖${chance}机会，进行抽奖\n`
    for (let i = 0; i < chance; i++) {
      await doLottery()
    }
  }

  const finishTaskIds = await checkSign(ret.doTaskList)
  // console.log(3, finishTaskIds)

  await execTasks(ret.taskList, finishTaskIds)

  await $.wait(2000)
}


/**
 * 检查打卡
 */
async function checkSign(doTaskList) {
  let canSign = !doTaskList || doTaskList.length == 0
  // console.log(1, canSign, doTaskList)
  if (!canSign) {
    const signTask = doTaskList.filter(e => {
      return e.taskId == 0
    })
    canSign = !signTask || signTask.length == 0
    // console.log(2, canSign, signTask)
  }

  if (canSign) {
    await doTask(0, '每天打卡', 0)
  }

  console.log(`今日已打卡，无需打卡`)
  $.message += `今日已打卡，无需打卡\n`

  const tasks = doTaskList || []
  return tasks.flatMap(e => e.taskId)
}


/**
 * 执行任务
 */
async function execTasks(taskList, finishTaskIds) {
  if (finishTaskIds.length - taskList.length == 1) {
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
  const params = `reqUrl=act2530&method=doTask&operType=1&actCode=2530&taskId=${taskId}&taskType=${taskType}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  console.log(`已完成任务：${taskName}，进行抽奖`)
  $.message += `已完成任务：${taskName}，进行抽奖\n`
  await $.wait(5000)

  await doLottery()
}


/**
 * 抽奖
 */
async function doLottery() {
  const params = `reqUrl=act2530&method=doLottery&operType=1&actCode=2530&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`抽奖成功，获得奖励：${ret.awardName}`)
  $.message += `抽奖成功，获得奖励：${ret.awardName}\n`

  await $.wait(2000)
}