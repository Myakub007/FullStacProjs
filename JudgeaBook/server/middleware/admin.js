const jwt = require('jsonwebtoken');

const admin = (req,res,next)=>{
    const token =req.cookies.token;
    const secret = process.env.Some_SECRET;
    const admin_email = process.env.Admin;
    if(!token){
        return res.status(401).redirect('/login')
    }
    try{
        const decoded = jwt.verify(token,secret);
        if(decoded.email!=admin_email){
            res.status(403).redirect('/');
        }else{
            next();
        }
    }catch(err){
        res.redirect('/');
    }
}

module.exports = admin;