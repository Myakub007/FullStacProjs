require('dotenv').config({ path: require('find-config')('.env') })
const mongoose = require('mongoose');
const uri = process.env.MongoDB_URI;
mongoose.connect(`${uri}/Judgeabook`);
const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    reviews:[{type:mongoose.Schema.Types.ObjectId,ref:'review'}]
});

const User = mongoose.model('user',userSchema);
module.exports = User;