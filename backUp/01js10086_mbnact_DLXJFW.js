const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { mbactFunc } = require('./function/01js10086_mbnact')

const $ = new Env('江苏移动_点亮心级服务')
const action = 'RWCJ00000116'

!(async () => {
  $.msg = ''
  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < options.length; i++) {
    $.index = i
    await initCookie($, i)

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
      const subTaskList = resultObj.taskSubList.filter(e => e.currentDoneCount == 0)
      if (subTaskList.length > 0) {
        $.msg += `查询可完成任务数：${subTaskList.length}\n`
        console.log(`${$.accountName}查询可完成任务数：${subTaskList.length}\n`)
        for (let j = 0; j < subTaskList.length; j++) {
          const task = subTaskList[j]
          if (task.taskType == 'BROWSE') {
            const billNo = await doTask(task)
            const billNo2 = await doneBrowseTask(task, billNo)
            $.msg += `\n`
            await $.wait(2000)

            await lotteryStrengthen()
          }
        }
      } else {
        $.msg += `今日已完成，无任务可做\n`
        console.log(`${$.accountName}今日已完成，无任务可做`)
      }
    } 
    
    console.log()
    $.msg += `\n\n`
  }
  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

/**
 * 查询活动信息
 */
async function queryTaskMain () {
  console.log(`${$.accountName}查询任务信息......`)
  return await mbactFunc($, 'queryTaskMain', action)
}

/**
 * 执行任务
 */
async function doTask (task) {
  console.log(`${$.accountName}执行任务${task.taskName}......`)
  const actNum = `${action}&configNum=${task.configNum}&taskType=${task.taskType}`
  const body = `actNum=${action}&configNum=${task.configNum}&taskType=${task.taskType}`
  return await mbactFunc($, 'doTask', actNum, body)
}

/**
 * 完成任务
 */
async function doneBrowseTask (task, billNo) {
  console.log(`${$.accountName}成功执行任务: ${task.taskName}......`)
  const actNum = `${action}&billNum=${billNo}`
  const body = `actNum=${action}&billNum=${billNo}`
  $.msg += `成功执行任务: ${task.taskName}\n`
  return await mbactFunc($, 'doneBrowseTask', actNum, body)
}

/**
 * 抽奖
 */
async function lotteryStrengthen () {
  const resultObj = await mbactFunc($, 'lotteryStrengthen', `${action}&sourcesNum=H5&featureCode=`)
  if (resultObj && resultObj.prize_name) {
    $.msg += `赢得${resultObj.prize_name}\n`
    console.log(`${$.accountName}赢得${resultObj.prize_name}`)
  }
}