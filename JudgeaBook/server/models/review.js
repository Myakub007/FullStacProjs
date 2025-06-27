const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    review : String,
})

const review = mongoose.model('review',reviewSchema);
module.exports = review;
