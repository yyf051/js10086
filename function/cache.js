let client
const oc = {}

const Cache = (c) => {
    client = c
    client.on("error", function(err) {
        console.log(err)
    })

    return oc
}

const get = (key) => {
    return new Promise((resolve) => {
        client.get(key, function(err, res) {
            resolve(JSON.parse(res))
        })
    })
}

oc.set = function(key, value) {
    value = JSON.stringify(value)
    return client.set(key, value, function(err) {
        if (err) {
            console.error(err)
        }
    })
}

oc.get = (key) => {
    return get(key)
}


oc.hset = function(key, field, value) {
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

oc.hget = (key, field) => {
    return hget(key, field)
}

oc.expire = function(key, time) {
    return client.expire(key, time)
}

module.exports = Cache