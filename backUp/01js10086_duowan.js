const Env = require('./common/Env')

const $ = new Env('江苏移动-萌鹿乐园')

const {
  setConstCookie
} = require('./common/01js10086_common')

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366;dovan_hybrid;dw_osVersion=12.0&dw_osCode=12.0&dw_manufacturer=apple&dw_model=iPhone10,1&dw_density=2&dw_deviceHeight=667&dw_deviceWidth=375&dw_appName=ecmc&dw_pkgName=com.jsmcc.ZP7267A6ES&dw_appVersion=8.4.9&dw_networkType=1&dw_carrier=0&dw_gdt=1&dw_tt=0;ua=jsmcc&platform=iphone&channel=sd&ch=03&version=8.4.9&netmode=WiFi&cityCode=(null)&JType=0&platformExpland=iPhone%208&audit=0&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&dw_openUDID=28a4540430c5833595de218154df4cc7fb26c511&dw_idfa=AB6D498D-DBC2-AC0B-A23B-1CCE754861AE&loginmobile=66ae93344d4a4662ca90b97b80905170&cmtokenid=C97197B84C5345CC817915C772C6F46E@js.ac.10086.cn&time=20220310174557'

const eTreeBody = 'channelid=DUOWAN&platform=iphone&version=8.4.9&deviceid=891DDB4F-ED63-4EF0-AF49-8F6EE6005F89&cityid=(null)&time=1647011116511&channelCode=YDZT&token=040354657830496C4F28AAAD2043AEA4E7D482911A046BAC&sign=1A3242EEA3435CB9992FB87DF9920FAE'

const host = `http://wap.js.10086.cn`

const dw_ua = []
const dw_body = []

!(async () => {
  for (let i = 0; i <= dw_ua.length; i++) {
    await doTask(i)
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done()
})

/**
 * 执行乐园任务
 */
function doTask (index) {
  return new Promise(async (resolve) => {

    // 领取树上的内容
    const jx = await eTree(index)
    for (let i = 0; i < jx.length; i++) {
      const f = await receive(index, jx[i].objectId, jx[i].category)
      $.log(`领取${jx[i].produceWay}, 共${jx[i].eBeanNum}个，${f ? '成功': '失败'}`)
    }

    // 玩豆子任务1
    // const taskList1 = await eBeanTasks(index)
    // for (let i = 0; i < taskList1.length; i++) {
    //   const task = taskList1[i]
    //   const f = await playGame(index, jx[i].objectId)
    //   $.log(`进行${task.name}， 最高可得${task.rewardDesc}，${f ? '成功': '失败'}`)
    // }


    // 玩豆子任务2
    // await petGesture(index)
    // await petFeeding(index)
    // const taskList2 = await eBeanTasks2(index)
    // for (let i = 0; i < taskList2.length; i++) {
    //   const task = taskList2[i]
    //   const f = await receiveTask(index, task.id)
    //   $.log(`进行${task.name}，${f ? '成功': '失败'}`)
    // }
    resolve()
  })
}


/**
 * 豆子任务
 */
function eBeanTasks (index) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/ebean/tasks.do',
      dw_ua[index],
      dw_body[index]
    )

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      data = JSON.parse(data)
      console.log('eBeanTasks: ', data.code == '0', data.errorCode == '0')
      if (data.code == '0' && data.errorCode == '0' && data.data) {
        const d = data.data.filter(e => {
          return e.f_tasktype == 'LL'
        })
        return resolve(d || [])
      }
      return resolve([])
    })
  })
}

/**
 * 豆子任务2
 */
function eBeanTasks2 (index) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/task/list.do',
      dw_ua[index],
      `${dw_body[index]}&taskType=2`
    )

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      data = JSON.parse(data)
      console.log('eBeanTasks: ', data.code == '0', data.errorCode == '0')
      if (data.code == '0' && data.errorCode == '0' && data.data) {
        const d = data.data.filter(e => {
          return e.status == '1'
        })
        return resolve(d || [])
      }
      return resolve([])
    })
  })
}

/**
 * 每天进行一次手势动作任务
 */
function petGesture (index) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/pet/gesture.do',
      dw_ua[index],
      dw_body[index]
    )

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      data = JSON.parse(data)
      console.log('petGesture: ', data.code == '0', data.errorCode == '0')
      return resolve(data.code == '0' && data.errorCode == '0')
    })
  })
}

/**
 * 每天进行一次喂食动作任务
 */
function petFeeding (index) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/pet/feeding.do',
      dw_ua[index],
      dw_body[index]
    )

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      data = JSON.parse(data)
      console.log('petGesture: ', data.code == '0', data.errorCode == '0')
      return resolve(data.code == '0' && data.errorCode == '0')
    })
  })
}

/**
 * 领取feeding task奖励
 */
function receiveTask (index, taskId) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/task/receive.do',
      dw_ua[index],
      `${dw_body[index]}&taskId=${taskId}`
    )

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      data = JSON.parse(data)
      return resolve(data.code == '0' && data.errorCode == '0')
    })
  })
}

/**
 * 树
 */
function eTree (index) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/ebean/eTree.do',
      UA,
      eTreeBody
    )

    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      data = JSON.parse(data)
      console.log('eTree: ', data.code == '0', data.errorCode == '0')
      if (data.code == '0' && data.errorCode == '0' && data.data) {
        let d = []
        const eBeanTreeList = data.data.eBeanTreeList
        if (eBeanTreeList) {
          for(let key in eBeanTreeList) {
            d = d.concat(eBeanTreeList[key] || [])
          }
        }
        // console.log('eTree Data: ', JSON.stringify(d))
        return resolve(d)
      }
      return resolve([])
    })
  })
}

// D773447AAB4433CCA16370FB3C0FA449
/**
 * 领取ETree奖励
 */
function receive (index, objectId, category) {
  return new Promise((resolve) => {
    const options = combineTaskOption(
      '/ex/grow_web/deer-feeding/ebean/receive.do',
      UA,
      `${eTreeBody}&objectId=${objectId}&category=${category}`
    )
    // console.log(JSON.stringify(options))
    $.post(options, async (err, resp, data) => {
      if (err) throw new Error(err)
      console.log('receive: ', data)
      data = JSON.parse(data)
      return resolve(data.code == '0' && data.errorCode == '0')
    })
  })
}



function combineTaskOption (path, ua, body) {
  const url = `${host}${path}`
  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-us',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Origin': 'http://wap.js.10086.cn',
    'Content-Length': '235',
    'Cookie': setConstCookie(),
    'Connection': 'keep-alive',
    'User-Agent': ua
  }
  return {
    url, headers, body
  }
}
