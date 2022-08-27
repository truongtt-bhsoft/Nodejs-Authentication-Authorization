const mongoose = require('mongoose')
const winston = require('winston')

const MONGODB_URL = process.env.MONGODB_URL

module.exports = function () {
    mongoose
        .connect(MONGODB_URL)
        .then(() => winston.info("Connected to MongoDB"))
}