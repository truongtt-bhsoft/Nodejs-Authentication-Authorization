const User = require('./users')
const Joi = require('joi')
const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 1, maxlength: 200 },
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
})

const Book = mongoose.model('Book', bookSchema)

const validateBook = (book) => {
    const schema = {
        name: Joi.string().min(1).max(200).required(),
        author: Joi.string().min(1).max(200).required()
    }

    return Joi.validate(book, schema)
}

module.exports.Book = Book
module.exports.validate = validateBook