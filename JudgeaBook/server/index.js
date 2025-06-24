const express = require('express');
const app = express();

app.set("view engine",'ejs');

const path = require('path')
const cookieParser = require('cookie-parser');
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("views",path.join(__dirname,"../app/views"))

app.get('/',(req,res)=>{
    res.send('working');
})

app.get('/signup',(req,res)=>{
    res.render("login");
})

app.listen(3000);