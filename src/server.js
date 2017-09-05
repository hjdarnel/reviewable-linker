// src/server.js
const Express = require('express')
const bodyParser = require('body-parser')
const bunyan = require('bunyan')

const connect = require('./slack.js')

const logger = bunyan.createLogger({name: 'reviewable-linker'})

const app = new Express()
app.use(bodyParser.urlencoded({extended: true}))

const {SLACK_TOKEN: slackToken, PORT} = process.env

const port = PORT || 80

app.use(bodyParser.json());

connect()

app.post('/', (req, res) => {
    logger.info('Request received')

    
})

app.listen(port, () => {
    logger.info(`Server started at localhost:${port}`)

})
