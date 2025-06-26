require('dotenv').config();
const mongoose = require('mongoose');
const bookSchema = mongoose.Schema({
    title:String,
    author:String,
    genre:String,
    dscrptn:String
})

const book = mongoose.model('book',bookSchema);
module.exports = book;