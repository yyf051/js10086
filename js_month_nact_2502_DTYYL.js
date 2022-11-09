/*
江苏移动_答题月月乐
cron:45 25 9 5 * *
*/
const answers = {
  '1': 'C',
  '10': 'B',
  '103': 'C',
  '104': 'A',
  '105': 'B',
  '106': 'C',
  '107': 'A',
  '108': 'C',
  '109': 'A',
  '11': 'C',
  '110': 'C',
  '111': 'B',
  '112': 'A',
  '114': 'A',
  '117': 'A',
  '118': 'B',
  '12': 'A',
  '120': 'A',
  '121': 'A',
  '122': 'C',
  '123': 'B',
  '124': 'B',
  '125': 'B',
  '126': 'B',
  '127': 'C',
  '128': 'A',
  '129': 'A',
  '14': 'C',
  '15': 'B',
  '17': 'B',
  '18': 'A',
  '19': 'B',
  '20': 'A',
  '22': 'C',
  '23': 'B',
  '24': 'A',
  '25': 'B',
  '26': 'C',
  '27': 'A',
  '28': 'B',
  '32': 'C',
  '33': 'C',
  '34': 'A',
  '35': 'B',
  '36': 'A',
  '37': 'A',
  '40': 'A',
  '43': 'A',
  '44': 'B',
  '45': 'B',
  '48': 'A',
  '5': 'C',
  '57': 'A',
  '58': 'A',
  '59': 'B',
  '6': 'B',
  '60': 'A',
  '61': 'A',
  '62': 'B',
  '63': 'A',
  '64': 'A',
  '69': 'B',
  '7': 'A',
  '73': 'A',
  '74': 'A',
  '8': 'C',
  '9': 'A',

}

const Env = require('./function/01Env')
const { getMobieCK } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_答题月月乐')

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
    
    // $.isLog = true
    console.log($.phone)
    $.msg += `<font size="5">${$.phone}</font>\n`
    await initIndexPage()
    
    console.log()
    $.msg += `\n\n`
    await $.wait(10000)
  }

  console.log(`通知内容：\n\n`, $.msg)
  await $.sendNotify($.name, $.msg)
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
    $.msg += `存在答题机会，进行答题\n`
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
    $.msg += `本月答题机会已用完\n`
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
  $.msg += `抽奖成功，获得奖励：${ret.prizeName}\n`

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
  $.msg += `30E豆换答题机会成功，进行答题\n`
  
  await $.wait(2000)
}