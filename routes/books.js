const _ = require('lodash')
const bcrypt = require('bcrypt')
const { Book, validate } = require('../models/books')
const express = require('express')
const router = express.Router()
const asyncMiddleware = require('../middleware/async')

router.post('/', asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let book = await Book.findOne({ name: req.body.name, author: req.body.author })
    if (book) return res.status(400).send('Book already added.')

    book = new Book(_.pick(req.body, ['name', 'author']))

    await book.save()

    res.send(book)
}))

module.exports = router