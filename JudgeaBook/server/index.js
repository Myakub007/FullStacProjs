require('dotenv').config();
const secret = process.env.Some_SECRET;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const session = require('express-session');

const userModel = require('./models/user');
const bookModel = require('./models/book')


app.set("view engine",'ejs');

const path = require('path');
const cookieParser = require('cookie-parser');
const { MessageEvent } = require('http');
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));
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
            let token =jwt.sign({email},secret)
            res.cookie("token",token);
            res.send(createdUser);

        })
    });
})
app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect('/signup');
})
app.get('/login', (req,res)=>{
    res.render('login')
})
app.post('/login', async(req,res)=>{
    let user = await userModel.findOne({email: req.body.email})
    if(!user) return res.alert("Email or password is incorrect!");
    else{
        bcrypt.compare(req.body.password,user.password,(err,result)=>{
            if(result){
                let token =jwt.sign({email:user.email},secret)
                res.cookie("token",token);
                res.send("Logged in")
            }
            else{
                res.send('Email or password is incorrect');
            }
        })
    }
})
app.get('/addbook',(req,res)=>{
    const message = req.session.message;
    delete req.session.message;
    res.render('addbook',{message});
})
app.post('/addbook', async(req,res)=>{
    let {title,author,genre,dscrptn} = req.body;
    let addedBook = await bookModel.create({
        title,
        author,
        genre,
        dscrptn
    })
    req.session.message='Book Added Successfully!';
    res.redirect('/addbook');
    
})
app.listen(3000);