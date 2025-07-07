// require('dotenv').config({ path: require('find-config')('.env') })
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('find-config')('.env') });
}
const mongoose = require('mongoose');
const uri = process.env.MongoDB_URI;
if (process.env.NODE_ENV !== 'production') {
    mongoose.connect(`${uri}/Judgeabook`).then(() => {
        console.log("Connected to MongoDB")}).catch((err) => {
        console.error("Error connecting to MongoDB:", err);})
}
else {
    mongoose.connect(`${uri}`, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("Error connecting to MongoDB:", err));
const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    reviews:[{type:mongoose.Schema.Types.ObjectId,ref:'review'}]
});

const User = mongoose.model('user',userSchema);
module.exports = User;