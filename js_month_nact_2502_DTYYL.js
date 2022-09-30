const Env = require('./01Env')
const { options, initCookie } = require('./01js10086_common')
const { nactFunc } = require('./01js10086_nact')

const $ = new Env('江苏移动_答题月月乐')
const answers = {
  '61': 'A',
  '15': 'B',
  '23': 'B',
  '116': 'A',
  '103': 'C',
  '36': 'A',
  '8': 'C',
  '63': 'A',
  '73': 'A',
  '129': 'A',
  '34': 'A',
  '10': 'B',
  '43': 'A',
  '35': 'B',
  '18': 'A',
  '124': 'B',
  '104': 'A',
  '24': 'A',
  '108': 'C',
  '9': 'A',
  '128': 'A',
  '48': 'A',
  '44': 'B',
  '14': 'C',
  '114': 'A',
  '11': 'C',
  '127': 'C',
  '33': 'C',
  '74': 'A',
  '40': 'A',
  '17': 'B',
  '37': 'A',
  '26': 'C',
  '59': 'B',
  '7': 'A',
  '1': 'C',
  '69': 'B',
  '25': 'B',
  '45': 'B',
  '6': 'B',
  '121': 'A',
  '117': 'A',
  '5': 'C',
  '32': 'C',
  '122': 'C',
  '22': 'C',
  '106': 'C',
  '109': 'A',
  '57': 'A',
  '107': 'A',
  '112': 'A',
  '64': 'A',
  '27': 'A',
  '120': 'A',
  '118': 'B',
  '62': 'B',
  '111': 'B',
  '28': 'B',
  '123': 'B',
  '58': 'A'
}

!(async () => {
  $.message = ''
  for (let i = 0; i < options.length; i++) {
  // for (let i = 1; i < 2; i++) {
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


function getAnswer() {
  const keys = Object.keys(answers)
  const index = Math.floor(Math.random() * keys.length)
  return {
    questionIds: keys[index],
    userAnswers: answers[keys[index]]
  }
}

/**
 * 初始化页面
 */
async function initIndexPage() {
  const params = `reqUrl=act2502&method=initIndexPage&operType=1&actCode=2502&extendParams=ch%3D03e5&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }

  console.log('题目：', JSON.stringify(ret.randomList))

  const chance = ret.chance
  if (chance && chance == 1) {
    console.log(`存在答题机会，进行答题`)
    $.message += `存在答题机会，进行答题\n`
    for (let i = 0; i < 5; i++) {
      const a = await answer()
      if (!a) {
        break
      }
    }
  } else if (chance && chance == 2) {
    // 换豆子答题
    await edExchange()
    for (let i = 0; i < 5; i++) {
      const a = await answer()
      if (!a) {
        break
      }
    }
  } else if (chance && chance == 3) {
    // 本月答题机会已用完
    console.log(`本月答题机会已用完`)
    $.message += `本月答题机会已用完\n`
  }

  await $.wait(2000)
}


async function answer() {
  const {questionIds, userAnswers} = getAnswer()
  console.log(`问题ID=${questionIds}，问题答案=${userAnswers}`)
  const params = `reqUrl=act2502&method=guessRiddles&operType=3&actCode=2502&answerType=1&questionIds=${questionIds}&userAnswers=${userAnswers}&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  
  if (!ret) {
    return false
  }

  console.log(`抽奖成功，获得奖励：${ret.prizeName}`)
  $.message += `抽奖成功，获得奖励：${ret.prizeName}\n`

  await $.wait(2000)
  return true
}


async function edExchange() {
  const params = `reqUrl=act2502&method=edExchange&operType=1&actCode=2502&extendParams=&ywcheckcode=&mywaytoopen=`
  const ret = await nactFunc($, params)
  if (!ret) {
    return
  }
  console.log(`30E豆换答题机会成功，进行答题`)
  $.message += `30E豆换答题机会成功，进行答题\n`
  
  await $.wait(2000)
}