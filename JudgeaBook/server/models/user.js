require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(`${process.env.MongoDB_URI}/Judgeabook`);
const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
});

const User = mongoose.model('user',userSchema);
module.exports = User;