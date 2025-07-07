const mongoose = require('mongoose');
const isbnFind = require('../api/isbnFind');
const bookSchema = mongoose.Schema({
    title:{
        type:String,
        minlength:1,
    },
    author:{
        type:String,
        minlength:3,
    },
    genre:{
        type:String,
        minlength:3,
    },
    dscrptn:{
        type:String,
        minlength:10,
    },
    isbn:{
        type:String,
    }
})
const book = mongoose.model('book',bookSchema);
module.exports = book;