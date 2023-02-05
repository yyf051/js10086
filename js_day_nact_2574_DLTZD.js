/*
http://wap.js.10086.cn/nact/resource/2574/html/index.html?shareToken=dQEWCORLKHrkeV2QtW/TUg==&rm=ydc
江苏移动_点亮兔子灯
cron:25 43 12 1 * *
*/
const Env = require('./function/01Env')
const { getMobieCK } = require('./function/01js10086_common')
const { nactFunc, getNactParams } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_点亮兔子灯')
const actCode = '2574'

const js10086 = require('./function/js10086')
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
    
    $.isLog = false
    $.isDirectReturnResultObj = true
    await initIndexPage()
    
    console.log()
    $.msg += `\n`
    console.log(`-------------------------------------\n`)
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
 * 初始化页面
 */
async function initIndexPage() {
  let resultObj = await nactFunc($, getNactParams(actCode, 'initIndexPage'), true)
  if (!resultObj) {
    return
  }

  if (resultObj.drawChance == '0') {
    console.log(`领取材料并抽奖...\n`)
    await doLottery(0)
  }

  await execTasks(resultObj.task)
}

/**
 * 执行任务
 */
async function execTasks(taskList) {
  for (let i = 0; i < taskList.length; i++) {
    const task = taskList[i]
    if (task.taskType == 2) {
      continue
    }
    if (task.taskState == 0) {
      await completeTask(task.taskId, task.taskName)
      await doLottery(task.taskId)
    } else if (task.taskState == 1) {
      await doLottery(task.taskId)
    }
  }
}


/**
 * 完成任务
 */
async function completeTask(taskId, taskName) {
  // const params = `reqUrl=act2539&method=completeTask&operType=1&actCode=2539&taskId=${taskId}&extendParams=&ywcheckcode=&mywaytoopen=`
  const params = getNactParams(actCode, 'completeTask')
  params.taskId = taskId
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  console.log(`已完成任务：${taskName}`)
  // $.msg += `已完成任务：${taskName}\n`
  await $.wait(5000)
}
/**
 * 抽奖
 */
async function doLottery(taskId) {
  // const params = `reqUrl=act2530&method=doLottery&operType=1&actCode=2530&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const params = getNactParams(actCode, 'doLottery')
  params.taskId = taskId
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`抽奖成功，获得奖励：${ret.prizeLog}`)
  $.msg += `抽奖成功，获得奖励：${ret.prizeLog}\n`

  await $.wait(2000)
}
