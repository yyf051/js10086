// 可爱猫通知对接
const request = require('request')

const kam_addr = process.env.KAM_ADDR || ''
const kam_wxid = process.env.KAM_BOT_ID || ''
const kam_token = process.env.KAM_TOKEN || ''


function sendNotice(msg, to_wxids) {
	if (!msg || !kam_addr || !kam_wxid || !to_wxids || to_wxids.length == 0) {
		return
	}
	for (let i = 0, j = to_wxids.length; i < j; i++) {
		const options = {
			'method': 'POST',
			'url': kam_addr,
			'headers': {
				'Content-Type': 'application/json',
				'Authorization': kam_token
			},
			body: JSON.stringify({
				'event': 'SendTextMsg',
				'robot_wxid': kam_wxid,
				'to_wxid': to_wxids[i],
				'msg': `${msg}`
			})
		}
		request(options)
	}
}

module.exports = sendNotice