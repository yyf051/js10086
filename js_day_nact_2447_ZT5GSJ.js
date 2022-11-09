/*
江苏移动_掌厅5G视界
cron:40 40 9 * * *
*/
const Env = require('./function/01Env')
const { options, getMobieCK } = require('./function/01js10086_common')
const { nactFunc } = require('./function/01js10086_nact')

const $ = new Env('江苏移动_掌厅5G视界')

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
    console.log(`${$.phone}获取活动信息......`)
    const params = 'reqUrl=act2447&method=initIndexPage&operType=1&actCode=2447&extendParams=&ywcheckcode=&mywaytoopen='
    const initRet = await nactFunc($, params)
    // console.log(`获取活动信息：`, initRet)
    if (!initRet) {
      continue
    }

    // 获取抽奖资格
    await $.wait(2000)
    await saveLotteryUser()

    const params3 = 'reqUrl=act2447&method=initIndexPage&operType=1&actCode=2447&extendParams=&ywcheckcode=&mywaytoopen='
    const initRet2 = await nactFunc($, params3)
    // console.log(`获取活动信息：`, initRet2)
    if (!initRet2) {
      continue
    }

    await $.wait(2000)
    const params2 = 'reqUrl=act2447&method=checkLottery&operType=1&actCode=2447&extendParams=&ywcheckcode=&mywaytoopen='
    const execResult = await nactFunc($, params2)
    if (!execResult) {
      continue
    }
    if (execResult.awardCode) {
      $.msg += `签到成功：${execResult.awardName}\n`
      console.log(`签到成功：${execResult.awardName}\n`)
    }
    
    console.log()
    $.msg += `\n\n`
    await $.wait(3000)
  }
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})


function saveLotteryUser () {
  return new Promise((resolve) => {
    var data = 'appBodyParam=CD6C4D642CB1E1FF0EF55C61DFFAF60BFDE4442FB410201C782A21FD0F5A4F64AFB72FED8CFD2DBDE2FB615CB449EEAEBEB968B0A3E6B7989E11782243DC6756EBBC16970DBFF26182ADB612F5F35CBD0D9297522E54A6798778EDE8E44354FEC0E0167872C4589864D1CD6F076C4D21FCD1A49A3BCF54592417D979296E499DAF6B7BB99FF57A7F8F2BA048956338C1F486C21B2F324A7BBD10742E07FB05A8A3851D3F7BEC5A78DB8D51E697DF9A641F139FB604DF3B057B25EBC9E7FF73F696A75637DDE18716DC85BFE4D7820947023A5733C85662AE6478290939380E562E87918889DAF1D69905980C5BC851E7254F5B7D74845DC0563A9A1F324A3F330B49578EA6A45B7E1B39FAF8EBEC5867D4B0EC783B2FE6C31A49B0035B7EDB14275BF61C4B5A6ED0E21A64309121A210A516DF123F9C41DBCA885313D3E0AF33D395B36CC3AD5A229133617B32E6D5E357DD228C856CE44FED3BC8FFC9D19961C1FDAE6685977E56EF3A4AA8118EAB1FBC378FB0DB8DFE5776DDFC71A7C6C1C0D92E4C5C427CEC2DA7D7081EFFB4D761FB8C921DF98BE23C61EBD3F1E8520AF4BC65B3533A89562E3503BF68604BBAFB6AB68E373F3506AE3F9134E4FF3F2570C62AB1C56BD50D6779FB7576D9E8AC39DDAAFE1A931E0B9BEC2957BE89531128193B4C207215F16DEBC74F6BF7F83DF182928668F19EEE5DCE5C51860AA0BA9A0FE06DF0F1A274D22349D0B79880FCAC875E8E5DF771E6656394CCE5674D7A471510E23D5E320F16168BB60413ECE5C3978E02F473EED0925179E349D1EB63C9EE73F52E40825BE5E63749EAEE2DFE571910F8AB855C46CEC66418890932941518E99776B39192AA95CD3673DE1DD7DC4EAFFBBC51B4D1C8D928DF53C51ED69B167961269EE89801B7D88E84680107276F0A115E51B704A5E8B4558718EC4D1FD96C09B14B30120FB4473765822E7A2296FA9B87E555A85C187FBA37B196635B5131B960B62B62A0592B98941A16DDE915BC6930541A1939'
    const options = {
      url: 'https://wap.js.10086.cn/jsmccClient/action.dox',
      headers: { 
        'requestUrl': '', 
        'currentUrl': 'FoundNewActivity', 
        'X-Requested-With': 'XMLHttpRequest', 
        'X-Online-Host': 'wap.js.10086.cn', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0', 
        'channel': 'T_SJZS', 
        'version': '8.4.9.3', 
        'platform': 'android', 
        'uc': '2050', 
        'LC-PN': `${$.phone}`, 
        'LC-SYSVERSION': '9', 
        'LC-IFS': 'publicController_saveLotteryUser', 
        'hgvhv': 'B50AaF6AAbE9F6CD7F5BBF7791982B8E46', 
        'Charset': 'UTF-8', 
        'Host': 'wap.js.10086.cn', 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Cookie': $.setCookie
      },
      body : data
    }

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      console.log(`${$.phone}获取抽奖资格`)

      resolve()
    })
  })

}