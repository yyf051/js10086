/*
江苏移动_签到任务
cron:25 25 10 * * *
*/
const Env = require('./function/Env')
const { getMobieCK } = require('./app/appLogin')
const { nactFunc } = require('./app/appNact')

const $ = new Env('江苏移动_签到任务')

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
    
    await initIndexTasks()

    await $.wait(10000)
    console.log()
    $.msg += `\n`
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch(async (e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  await $.sendNotify($.name, "签到失败，手动检查...")
}).finally(() => {
  $.done()
})

/**
 * 查询任务列表
 */
async function initIndexTasks() {
  await $.wait(2000)
  const params = 'reqUrl=act2510&method=initIndexTasks&operType=1&actCode=2510&extendParams=&ywcheckcode=&mywaytoopen='
  const resultObj = await nactFunc($, params)
  // console.log(resultObj)
  const okTaskIds = []
  if (resultObj && resultObj.userTasksOpr) {
    console.log(`${$.phone}成功查询已完成E豆任务列表：${resultObj.userTasksOpr.length}`)
    $.msg += `成功查询E豆任务列表：${resultObj.userTasksOpr.length}\n`
    for (let i = 0; i < resultObj.userTasksOpr.length; i++) {
      const task = resultObj.userTasksOpr[i]
      okTaskIds.push(task.taskId)
      if (task.status == 0) {
        await receiveTaskAward(task.taskId)
      } else if (task.status == 1) {
        // 奖励已领取，不处理
      }
    }
  }

  if (resultObj && resultObj.tasksCfg) {
    console.log(`${$.phone}成功查询E豆任务列表：${resultObj.tasksCfg.length}`)
    $.msg += `成功查询E豆任务列表：${resultObj.tasksCfg.length}\n`
    for (let i = 0; i < resultObj.tasksCfg.length; i++) {
      const task = resultObj.tasksCfg[i]
      if (okTaskIds.indexOf(task.taskId) == -1) {
        if (task.taskId == 'kq_task_01') {
          await execCouponTask(task.taskId)
        } else if (task.taskId == 'act_task04') {
          await execSpecialTask(task.taskId,  task.taskName, 'LLSD')
        } else if (task.taskId == 'act_task_05') {
          await execSpecialTask(task.taskId,  task.taskName, 'HYCSNEW')
        } else if (task.taskId == 'act_task_06') {
          await execMLLYTask(task.taskId,  task.taskName, '2510')
        } else if (task.taskId == 'act_task_03') {
          await turntable(task.taskId, task.taskName, '2135', 'initIndexPage')
        } else if (task.url.indexOf('https://wap.js.10086.cn/nact/resource/') > -1) {
          const actNo = task.url.substring('https://wap.js.10086.cn/nact/resource/'.length).split('/')[0]
          await turntable(task.taskId, task.taskName, actNo)
          $.msg += '\n'
        // } else if (task.url.indexOf('https://wap.js.10086.cn/vw/navbar/') > -1) {
        //   const actNo = task.url.substring('https://wap.js.10086.cn/nact/resource/'.length).split('/')[0]
        //   await turntable(task.taskId, task.taskName, actNo)
        //   $.msg += '\n'
        } else {
          console.log(`任务信息：${JSON.stringify(task)}`)
        }
      }
    }
  }
}

async function execMLLYTask (taskId, taskName, actNo) {
  await $.wait(2000)
  console.log(`${$.phone}完成E豆任务：${taskName}......`)

  const params = `reqUrl=act${actNo}&method=completeTask&operType=1&actCode=${actNo}&taskId=${taskId}&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)

  await $.wait(5000)
  await receiveTaskAward(taskId)
}



async function execSpecialTask (taskId, taskName, bizCode, flag = true) {
  await $.wait(2000)
  console.log(`${$.phone}完成E豆任务：${taskName}......`)
  return new Promise((resolve) => {
    const data = {
        "taskId": taskId,
        "wapContext": {
            "channel": "",
            "netType": "",
            "optType": "1",
            "bizCode": bizCode,
            "pageCode": bizCode,
            "markCdeo": `TxGuddOIS7WXoueQNSkvAQ==-${bizCode}-${bizCode}-${(new Date()).getTime()}`,
            "subBizCode": bizCode,
            "effect": "",
            "verifyCode": ""
        }
    }
    const option = {
      method: 'post',
      url: 'https://wap.js.10086.cn/vw/gateway/biz/eSignIn/qd',
      headers: { 
        'Host': 'wap.js.10086.cn', 
        'Accept': 'application/json, text/plain, */*', 
        'Referer': 'https://wap.js.10086.cn/', 
        'X-Requested-With': 'com.jsmcc', 
        'Content-Type': 'application/json;charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': $.ua,
        'Cookie': $.setCookie
      },
      body : JSON.stringify(data)
    }

    $.post(option, async (err, resp, data) => {
      console.log(data)
      data = JSON.parse(data)
      if (data.code == '200') {
        await $.wait(8000)
        await receiveTaskAward(taskId)
      } else {
        await $.wait(2000)
        if (flag) {
          execSpecialTask(taskId, taskName, bizCode, false)
        }
      }
      resolve()
    })
  })
}

async function execCouponTask (taskId) {
  await $.wait(2000)
  console.log(`${$.phone}完成E豆任务：卡券中心......`)
  return new Promise((resolve) => {
    const data = 'reqUrl=ActGrowZone&method=newCompleteEBeanTask&operType=1&actCode=wap&taskid=kq_task_01&browserFinger=&mywaytoopen=&extendParams=showType%3D1%26task2510Id%3Dkq_task_01%26task2510Status%3D0';
    const option = {
      method: 'post',
      url: 'http://wap.js.10086.cn/kqzx/action.do',
      headers: { 
        'Host': 'wap.js.10086.cn', 
        'Accept': 'application/json, text/javascript, */*; q=0.01', 
        'hgvhv': 'null', 
        'X-Requested-With': 'XMLHttpRequest', 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 
        'Origin': 'http://wap.js.10086.cn', 
        'Referer': 'http://wap.js.10086.cn/kqzx/resource/wap/html/index.html?showType=1&task2510Id=kq_task_01&task2510Status=0', 
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': $.ua,
        'Cookie': $.setCookie
      },
      body : data
    }

    $.post(option, async (err, resp, data) => {
      await $.wait(8000)
      await receiveTaskAward(taskId)
      resolve()
    })
  })
}

/**
 * 执行E豆任务
 */
async function turntable(taskId, taskName, actNo, methodName = 'turntable') {
  await $.wait(2000)
  $.isDirectReturnResultObj = true
  console.log(`${$.phone}执行E豆任务：${taskName}......`)
  $.msg += `执行E豆任务：${taskName}......\n`
  const params = `reqUrl=act${actNo}&method=${methodName}&actCode=${actNo}&extendParams=thass%3D1%26task2510Id%3D${taskId}%26task2510Status%3D0&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)

  await $.wait(8000)
  await newCompleteEBeanTask(taskId, taskName, actNo)
  $.isDirectReturnResultObj = false
}

/**
 * 完成E豆任务
 */
async function newCompleteEBeanTask(taskId, taskName, actNo) {
  await $.wait(2000)
  console.log(`${$.phone}完成E豆任务：${taskName}......`)
  const params = `reqUrl=act${actNo}&method=newCompleteEBeanTask&task2510Id=${taskId}&actCode=${actNo}&extendParams=thass%3D1%26task2510Id%3D${taskId}%26task2510Status%3D0&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)
  
  // console.log('newCompleteEBeanTask', resultObj)
  if (resultObj && resultObj.liulan == 1) {
    console.log(`${$.phone}成功完成E豆任务：${taskName}......`)
    $.msg += `成功完成E豆任务：${taskName}......\n`
    await receiveTaskAward(taskId)
  }
}

async function receiveTaskAward(taskId) {
  await $.wait(2000)
  console.log(`${$.phone}领取5E豆任务奖励......`)
  const params = `reqUrl=act2510&method=receiveTaskAward&operType=1&actCode=2510&taskId=${taskId}&extendParams=&ywcheckcode=&mywaytoopen=`
  const resultObj = await nactFunc($, params)

  if (resultObj) {
    console.log(`${$.phone}领取5E豆任务奖励成功......`)
    $.msg += `领取5E豆任务奖励......\n`
  }
}