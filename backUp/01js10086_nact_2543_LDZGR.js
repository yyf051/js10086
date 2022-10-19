const Env = require('./function/01Env')
const { options, initCookie } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const aNo = 2543

const seqList = []

const $ = new Env('江苏移动_劳动最光荣')
!(async () => {
  $.message = ''
  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)
    await queryOrder()
  }
  console.log(seqList)
  await $.wait(30000)

  for (let i = 0; i < options.length; i++) {
    await initCookie($, i)

    // $.isLog = true
    console.log($.phone)
    $.message += `<font size="5">${$.phone}</font>\n`
    for (let j = 0; j < seqList.length; j++) {
      let m = 0;
      if (j != i && m < 3) {
        const ep = `orderNum%3D${seqList[j]}`
        const zhurR = await zhuli(ep)
        if (!zhurR) {
          console.log('xxxxxxxxxxx')
          break;
        } else {
          m++;
        }
      }
    }
    await $.wait(2000)

    await initIndexPage()
    
    console.log()
    $.message += `\n\n`
    await $.wait(6000)
  }

  console.log(`通知内容：\n\n`, $.message)
  await $.sendNotify($.name, $.message)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})


async function zhuli(ep) {
  const params = `reqUrl=act${aNo}&method=initIndexPage&operType=1&actCode=${aNo}&extendParams=${ep}&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return false
  }
  await $.wait(2000)
  return true
}


/**
 * 初始化页面
 */
async function initIndexPage() {
  const params = `reqUrl=act${aNo}&method=initIndexPage&operType=1&actCode=${aNo}&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  // await lu1();
  // await lu2();

  const chance = ret.lotterychance
  if (chance && chance > 0) {
    console.log(`存在抽奖${chance}机会，进行抽奖`)
    $.message += `存在抽奖${chance}机会，进行抽奖\n`
    for (let i = 0; i < chance; i++) {
      await doLottery()
    }
  }

  await doShopLog(ret.ShopLog)

  await todayTask()

  // const finishTaskIds = await checkSign(ret.doTaskList)
  // console.log(3, finishTaskIds)
  await $.wait(2000)
}

async function doShopLog(ShopLog) {
  const tasks = ShopLog.filter(e => {
    return e.fState == 0
  })
  if (tasks.length == 0) {
    console.log(`今日ShopLog均已完成，无需执行`)
    $.message += `今日ShopLog均已完成，无需执行\n`
    return true;
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    await shopState(task.fId, task.fId)
  }
  console.log(`ShopLog均已完成`)
  $.message += `ShopLog均已完成\n`
}


/**
 * 完成任务
 */
async function shopState(taskId, taskName) {
  const params = `reqUrl=act${aNo}&method=shopState&id=${taskId}&actCode=${aNo}&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  // console.log(`已完成任务：${taskName}，汗水加5`)
  // $.message += `已完成任务：${taskName}，汗水加5\n`
  await $.wait(2000)
}


async function queryOrder() {
  const params = `reqUrl=act${aNo}&method=queryOrder&actCode=${aNo}&extendParams=ch%3D0202&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }
  if (ret.flag == 1) {
    await createOrder()
  }
}

async function createOrder() {
  const params = `reqUrl=act${aNo}&method=createOrder&type=1&actCode=${aNo}&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }
  seqList.push(ret.seq)
  console.log(`seq=${ret.seq}`)
  $.message += `seq=${ret.seq}\n`
}


async function todayTask() {
  const params = `reqUrl=act${aNo}&method=todayTask&actCode=${aNo}&extendParams=ch%3D0202&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  const tasks = ret.TaskLogList.filter(e => {
    return e.fState == 0
  })

  await execTasks(tasks)
  await $.wait(1000)
}

// lu2
/**
 * 检查打卡
 */
async function lu1() {
  const params = `reqUrl=act${aNo}&method=headLottery&type=lu1&actCode=${aNo}&extendParams=ch%3D0202&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  console.log(`做任务，获得奖励：${ret.awardName}`)
  $.message += `做任务，获得奖励：${ret.awardName}\n`
  await $.wait(2000)
}
async function lu2() {
  const params = `reqUrl=act${aNo}&method=headLottery&type=lu2&actCode=${aNo}&extendParams=ch%3D0202&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)

  if (!ret) {
    return
  }

  if (ret.awardName) {
    console.log(`做任务，获得奖励：${ret.awardName}`)
    $.message += `做任务，获得奖励：${ret.awardName}\n`
  } else {
    console.log(`做任务，获得奖励：${JSON.stringify(ret)}`)
    $.message += `做任务，获得奖励：${JSON.stringify(ret)}\n`
  }
  await $.wait(2000)
}

/**
 * 执行任务
 */
async function execTasks(taskList) {
  if (taskList.length == 0) {
    console.log(`今日任务均已完成，无需执行`)
    $.message += `今日任务均已完成，无需执行\n`
    return true;
  }

  for (let i = 0; i < taskList.length; i++) {
    const task = taskList[i]
    await doTask(task.fId, task.fTitle)
  }
}

/**
 * 完成任务
 */
async function doTask(taskId, taskName) {
  const params = `reqUrl=act${aNo}&method=taskState&id=${taskId}&actCode=${aNo}&extendParams=ch%3D0202&ywcheckcode=&mywaytoopen=`
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
  const params = `reqUrl=act${aNo}&method=taskLottery&actCode=${aNo}&extendParams=ch%3D0202&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return
  }

  console.log(`抽奖成功，获得奖励汗水：${ret.hanshui}`)
  $.message += `抽奖成功，获得奖励汗水：${ret.hanshui}\n`

  await $.wait(2000)
}