const mongoose = require('mongoose');


const now = new Date(Date.now());

const options = {
  weekday: 'short',  // use 'long' for full name (Saturday)
  day: 'numeric',
  month: 'short',    // use 'long' for full month name (June)
  year: 'numeric'    // optional, remove if you don't want it
};

const formattedDate = now.toLocaleDateString('en-US', options); 

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
        type: String,
        default:formattedDate
    }

})

const review = mongoose.model('review',reviewSchema);
module.exports = review;
