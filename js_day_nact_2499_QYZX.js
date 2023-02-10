/*
江苏移动_权益中心
cron:25 5 10 * * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const { nactFunc } = require('./app/appNact')

const $ = new Env('江苏移动_权益中心')

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
    $.setCookie = await getMobieCK($.phone, bodyParam)
    
    await initIndexPage()
    
    console.log()
    $.message += `\n\n`
    await $.wait(10000);
  }
  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

/**
 * 查询签到信息
 */
async function initIndexPage () {
  console.log(`${$.phone}获取活动信息......`)
  const params = 'reqUrl=act2499&method=initIndexPage&operType=0&actCode=2499&extendParams=&ywcheckcode=&mywaytoopen='
  const resultObj = await nactFunc($, params)
  if (!resultObj) {
    return false
  }
  if (resultObj.status == 4 || resultObj.status == 2) {
    await signAndDraw()
    await $.wait(2000)
    return await initIndexPage()
  }

  const validTasks = resultObj.allTaskList.filter(e => !e.hasOwnProperty('remark'))

  if (resultObj.status == 5 && validTasks.length == 0) {
    $.message += `今日任务已完成\n`
    console.log(`今日任务已完成`)
    return
  }

  if (validTasks.length > 0) {
    for (let i = 0; i < validTasks.length; i++) {
      const task = validTasks[i]
      await playTask(task)
    }
    return await initIndexPage()
  }
}

/**
 * 完成任务
 */
async function playTask (task) {
  console.log(`${$.phone}进行${task.taskName}......`)
  const params = `reqUrl=act2499&method=doTask&operType=1&actCode=2499&taskId=${task.taskId}&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  $.message += `进行${task.taskName}......${resultObj && resultObj.isApp ? '---成功\n' : '---失败\n'}`

  await $.wait(5000)
  return true
}

async function signAndDraw () {
  console.log(`${$.phone}开始抽奖......`)
  const params = `reqUrl=act2499&method=signAndDraw&operType=1&actCode=2499&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  if (resultObj && resultObj.isApp) {
    $.message += `抽奖成功，获取：${resultObj.prizelog}\n`
    console.log(`抽奖成功，获取：${resultObj.prizelog}`)
  } else {
    $.message += `抽奖失败......\n`
    console.log(`抽奖失败......`)
  }
  await $.wait(2000)
}