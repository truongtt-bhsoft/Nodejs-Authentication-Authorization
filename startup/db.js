const mongoose = require('mongoose')
const winston = require('winston')

module.exports = function () {
    mongoose
        .connect("mongodb://localhost:27017/authentication-authorization")
        .then(() => winston.info("Connected to MongoDB"))
}