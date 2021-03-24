const keys = require('./keys')
const redis = require ('redis')

var redisClient = redis.createClient({
    host : keys.redishost ,
    port : keys.redisPort,
    retry_strategy : () => 1000

})
const sub = redisClient.duplicate()

const fib = index => {
    if(index<2) return 1
   return  fib(index-1) - fib(index -2)
}

sub.on('message' , (channel , message)=> redisClient.hset('values', fib(parseInt(message))) )