const express = require('express')
const usersRouter = require('../routes/users')
const authRouter = require('../routes/auth')
const booksRouter = require('../routes/books')
const error = require('../middleware/error')

module.exports = function (app) {
    app.use(express.json())
    app.use('/api/users', usersRouter)
    app.use('/api/auth', authRouter)
    app.use('/api/books', booksRouter)
    app.use(error)
}