const redis = require("redis");
const config = require('../conf/globalConfig').redisConfig
 
let client = redis.createClient(config);

client.on("error",function(err){
    console.log(err);
});
 
function Cache() {}

Cache.client = client;

let text = async(key)=>{
    console.log(key)
    let doc = await new Promise( (resolve) => {
        client.get(key,function(err, res){
            //console.log(err, res)
			return resolve(res);
        });
    });
	//console.log(doc)
    return JSON.parse(doc);
};
 
Cache.set = function(key, value) {
    value = JSON.stringify(value);
    return client.set(key, value, function(err){
        if (err) {
            console.error(err);
        }
    });
};
 
Cache.get = async(key)=>{
    return await text(key);
};
 
Cache.expire = function(key, time) {
    return client.expire(key, time);
};
 
module.exports = Cache;
