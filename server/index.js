const keys = require("./keys")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const {Pool} = require('pg')
const redis = require('redis');
app.use(cors())
app.use(bodyParser.json())

const pgClient = new Pool({
    user : keys.pgUser ,
    host : keys.pgHost,
    database : keys.pgDatabase,
    password : keys.pgPassword,
    port : keys.pgPort
})

pgClient.on('error' , () => console.log('LOST PG CONNECTION'))

pgClient.query('CREATE TABLE IF NOT EXIST values (number INT')
.catch(err => {
    if(err)
{    throw err
}})

var redisClient = redis.createClient({
    host : keys.redishost ,
    port : keys.redisPort,
    retry_strategy : () => 1000

})
const redisPublisher  = redisClient.duplicate()

app.get('/' , (req,res) =>{
    res.send('works!')
})
app.get('/values/all' , async (req,res) => {
    const values = await pgClient.query('SELECT * FROM values')
    res.send(values.rows)
})
app.get('/values/current' , async (req,res) => {
    redisClient.hgall('values')
})
app.post('/values' , async (req , res) => {
    const index = req.params.index

    if(parseInt(index) < 40)
    {
        return res.status(402).send('index is too height')
    }
   redisClient.hset('values' ,index , 'nothing yet')
   redisPublisher.publish('insert' , index)
   pgClient.query('INSERT INTO VALUES (number) VALUES($1)' , [index])
   res.send('its working ...')
})
app.listen(5000 , () => console.log('listning'))