const jwt =require('jsonwebtoken');

const auth = (req,res,next)=>{
    const token =req.cookies.token;
    const secret = process.env.Some_SECRET;
    if(!token){
        return res.status(401).redirect('/login');
    }try{
        jwt.verify(token,secret);
        next();
    }catch(err){
        res.status(401).redirect('/login');
    }
}

module.exports = auth;