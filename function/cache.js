let client 

function Cache(c) {
    client = c
    client.on("error", function(err) {
        console.log(err)
    })
}

const get = (key) => {
    return new Promise((resolve) => {
        client.get(key, function(err, res) {
            resolve(JSON.parse(res))
        })
    })
}

Cache.set = function(key, value) {
    value = JSON.stringify(value)
    return client.set(key, value, function(err) {
        if (err) {
            console.error(err)
        }
    })
}

Cache.get = (key) => {
    return get(key)
}


Cache.hset = function(key, field, value) {
    value = JSON.stringify(value)
    return client.hset(key, field, value, function(err) {
        if (err) {
            console.error(err)
        }
    })
}

function hget(key, field) {
    return new Promise((resolve) => {
        client.hget(key, field, function(err, res) {
            resolve(res && JSON.parse(res))
        })
    })
}

Cache.hget = (key, field) => {
    return hget(key, field)
}

Cache.expire = function(key, time) {
    return client.expire(key, time)
}

module.exports = Cache