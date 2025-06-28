const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    content : {
        type:String,
        required:true,
    },
    // book:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'book',
    // },
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    like:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'user'
    },
    date:{
        type: Date,
        default:Date.now
    }

})

const review = mongoose.model('review',reviewSchema);
module.exports = review;
