const jwt =require('jsonwebtoken');
const userModel = require('../models/user')

const auth = async (req,res,next)=>{
    const token =req.cookies.token;
    const secret = process.env.Some_SECRET;
    if(!token){
        return res.status(401).redirect('/login');
    }try{
        const decoded = jwt.verify(token,secret);
        const user  = await userModel.findOne({_id:decoded.user}).select("-password");
        req.user = user;

        next();
    }catch(err){
        res.status(401).redirect('/login');
    }
}

module.exports = auth;