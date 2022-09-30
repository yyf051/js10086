const Env = require('./01Env')
const $ = new Env('Fa米家签到')

!(async () => {
  $.msg = ''
  console.log('执行Fa米家签到')
  await checkin()
  await $.wait(10000)
  await checkin2()
  await $.sendNotify($.name, $.msg)
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done();
})

function checkin () {
  return new Promise((resolve) => {
    console.log('1正在执行签到...')
    const option = {
      url: 'https://fmapp.chinafamilymart.com.cn/api/app/market/member/signin/sign',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'loginChannel': 'app',
        'os': 'ios',
        'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
        'Accept-Language': 'zh-Hans;q=1.0',
        'token': 'eyJhbGciOiJIUzUxMiIsInppcCI6IkRFRiJ9.eNo0jTkKAjEUhq8ir57ATPJethvYWFinSSYZHFEYJgqiWIqt3sXCC1l4C-PW_SvfAZabHiwEQ12MKTAZRWQotGG-4S3zbdBojIyKa6ggb0MZHxxscxpnfp0cWAePy23yPF8f95OD6ttN46dBTloa8qomo5QiJOKksJWoBHrVoBAkDAYeqBGF_Pn7Yfjdi2Kh3zs4Fnafc2H_orf3G7CNRF1r0iQqSLsBLHKs_0Gf56kbU16A7fwqp-MLAAD__w.qcIlx1gPvpLyisGEk_5j8Bt4CRIxyWo_erYd7kw_u8kqibBMPx6zBogpT-zjgXvSg63Oqm04rkI_bB7yEuDABA',
        'deviceId': '0698479F-6767-4751-AEEF-8BD89F45CDBC',
        'User-Agent': 'Fa',
        'smBox': 'BCDAKd1lDGogECj5/J+2ojQFRtJTrIXKla2AakpevUZ9hwk3hbDQcJec6UByZ3W75bQhBTysVfzKxqiffOaBs+Q==',
        'Content-Length': '2',
        'Connection': 'keep-alive',
        'fmVersion': '2.6.7',
        'blackBox': 'eyJ0b2tlbklkIjoiSmdUOEM0b2VjQTNFZXBsWDhpZlB2REZLUFhpdXJJUlo5aHhRRkJMQWZhYkJ1U2lFemxNdXZ3ak5wbTNQS2hsOGh2cG5TYUZxbnlScjQzVmpBRzZnaWc9PSIsIm9zIjoiaU9TIiwic2VxSWQiOiIxNjQ4MDg1ODIyMjQyNzI4OTE4IiwicHJvZmlsZVRpbWUiOjkxLCJ2ZXJzaW9uIjoiMy42LjcifQ=='      },
      body: JSON.stringify({})
    };
    $.post(option, async (err, resp, data) => {
      try {
        if (err) throw new Error(err)
        console.log('1执行结果：', data)
        $.msg += `账号1执行结果：${data}\n\n`
      } catch (e) {
        console.log(e, resp)
      } finally {
        resolve(data)
      }
    });
  })
}
function checkin2 () {
  return new Promise((resolve) => {
    console.log('2正在执行签到...')
    const option = {
      url: 'https://fmapp.chinafamilymart.com.cn/api/app/market/member/signin/sign',
      headers: {
        'blackBox': 'tdfpeyJvcyI6MSwidiI6IjMuNy4wLjMtUyIsInQiOiJKZ1Q4QzRvZWNBM0VlcGxYOGlmUHZOT3BkRDdiNEdoU09QUGhcL3l3SFYrc01GS0RudmhKZElOeTJtckQ5ck5ZZE5PZUxxZFBaS01oa01QMjFzT1hSMkE9PSJ9',
        'fmVersion': '2.6.8',
        'loginChannel': 'app',
        'os': 'android',
        'smBox': 'BQCR+l2zxSY191n9gvsGCgtyi24wGS/WuUhZhkXxEpGFpv9jVYmOSeng0fywNpcGtYbbfdnlfRQVLOgl6O/mMww==',
        'deviceId': '2255838931f363129bc5dfcb9c81ff4fc',
        'token': 'eyJhbGciOiJIUzUxMiIsInppcCI6IkRFRiJ9.eNo0TssKgzAQ_Jc9G9Dsrnn8Qa8955KYhFp6EKNQKv57t2BvM8O8DnhuM3jIOU_sUCvSlBWlOiiHhpQtSdNgOOkJoYO2JzEfAfZW1lsO4ANwNJaYWOxIcSTDVEdnnGHuqQpjmpgQDfKAGSXUBYjLcsUFqTR_ApzSP7cm_Zf043EDP4xke0uy0kF5L-DlY_8X5nYvdS3tAb7GVyvnFwAA__8.yGghrEezGUTsRVetznuOgtPVLA228w4qFUuS0t3tznPQ41nCAnmzFANjmVIm8_lj-jUZ3thuGE_v8LGWlqHVbg',
        'Content-Type': 'application/json',
        'channel': '333',
        'Content-Length': '0',
        'Host': 'fmapp.chinafamilymart.com.cn',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/4.7.2'
      },
      body: JSON.stringify({})
    };
    $.post(option, async (err, resp, data) => {
      try {
        if (err) throw new Error(err)
        console.log('2执行结果：', data)
        $.msg += `账号2执行结果：${data}\n\n`
      } catch (e) {
        console.log(e, resp)
      } finally {
        resolve(data)
      }
    });
  })
}