require('dotenv').config({path:"./.env.local"});
const secret = process.env.Some_SECRET;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const userModel = require('./models/user');


app.set("view engine",'ejs');

const path = require('path');
const cookieParser = require('cookie-parser');
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"../app/views"))

app.get('/',(req,res)=>{
    // console.log(process.env.MongoDB_URI)
    res.send('working');
})

app.get('/signup',(req,res)=>{
    res.render("signup");
})
app.post('/signup',(req,res)=>{
    let {username, email, password,}=req.body
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            let createdUser = await userModel.create({
                username,
                email,
                password:hash,
            })
            res.send(createdUser);
            let token =jwt.sign({email},secret)
            res.cookie("token",token);
        })
    });
})
app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect('/signup');
})

app.listen(3000);