require('dotenv').config()
const express = require('express')

require('./startup/logging')()
const app = express()
require('./startup/routes')(app)
require('./startup/db')()

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}...`)
})