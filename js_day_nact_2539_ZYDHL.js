/*
http://wap.js.10086.cn/nact/resource/2539/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_攒油兑好礼
cron:25 35 10 * * *
*/
const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_攒油兑好礼')
!(async () => {
  $.message = ''
  // for (let i = 1; i < 2; i++) {
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    // $.isLog = true
    console.log($.phone)
    $.message += `<font size="5">${$.phone}</font>\n`
    await initIndexPage()
    
    console.log()
    $.message += `\n`
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
  const params = `reqUrl=act2539&method=initIndexPage&operType=1&actCode=2539&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
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
  const params = `reqUrl=act2539&method=initIndexPage&operType=1&actCode=2539&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
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
  const params = `reqUrl=act2539&method=doTask&operType=1&actCode=2539&taskId=${taskId}&extendParams=&ywcheckcode=&mywaytoopen=`
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
  const params = `reqUrl=act2539&method=getTemporaryOil&operType=1&actCode=2539&getType=${getType}&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  $.myOil += Number.parseInt(oil)
  console.log(`领${oil}滴油成功`)
  $.message += `领${oil}滴油成功;`

  await $.wait(2000)
}