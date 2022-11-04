const globalConfig = require('../conf/globalConfig')
const { clientId, clientSecret } = globalConfig.qlClient

const domain = globalConfig.qingLongHost
const loginUrl = `${domain}/open/auth/token?client_id=${clientId}&client_secret=${clientSecret}`

const cache = require('./cache')
const cacheKey = 'QINGLONG_TOKEN'


const getAuthorization = async () => {
	let authorization
	try {
        authorization = await cache.get(cacheKey)
        if (!authorization) {
            const token = await getQinglongToken()
            if (token === 'failed') {
                return
            }
            
            console.log(JSON.stringify(token), '\n')
            authorization = token.data.token_type + ' ' + token.data.token

            cache.set(cacheKey, authorization)

            const seconds = token.data.expire - (new Date()).getTime() / 1000 - 10 * 60
            console.log('超时秒数：', seconds)
            cache.expire(cacheKey, seconds)
        } else {
            console.log('从Redis中获取token: ', authorization)
        }

    } catch(err) {
        console.log('获取青龙token失败', err)
    } finally {
        cache.client.quit()
    }

    return authorization
}


function getQinglongToken() {
    return new Promise((resolve) => {
        $.get({ url: loginUrl }, (error, response, data) => {
            try {
                if (error) {
                    console.log(`${JSON.stringify(error)}`)
                    console.log(`${$.name} getQinglongToken API请求失败`)
                    resolve('failed')
                } else {
                    resolve(JSON.parse(data))
                }
            } catch (e) {
                $.logErr(e, response)
                resolve('failed')
            }
        })
    })
}

module.exports = {
	getAuthorization
}