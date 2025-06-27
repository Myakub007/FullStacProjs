require('dotenv').config({ path: require('find-config')('.env') });
const secret = process.env.Some_SECRET;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const session = require('express-session');

const userModel = require('./models/user');
const bookModel = require('./models/book');
const reviewModel = require('./models/review');


app.set("view engine", 'ejs');

const path = require('path');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');
const isbnFind=require('./api/isbnFind');
app.use(session({
    secret: process.env.Some_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("views", path.join(__dirname, "../app/views"))

app.get('/', (req, res) => {
    // console.log(process.env.MongoDB_URI)
    res.send('working');
})

app.get('/signup', (req, res) => {
    res.render("signup");
})
app.post('/signup', (req, res) => {
    let { username, email, password, } = req.body
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
            })
            let token = jwt.sign({ email }, secret)
            res.cookie("token", token);
            res.send(createdUser);

        })
    });
})
app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/login');
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email })
    if (!user) return res.alert("Email or password is incorrect!");
    else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ email: user.email }, secret)
                res.cookie("token", token);
                res.send("Logged in")
            }
            else {
                res.send('Email or password is incorrect');
            }
        })
    }
})
app.get('/addbook', admin, (req, res) => {
    const message = req.session.message;
    delete req.session.message;
    res.render('addbook', { message });
})


app.post('/addbook', async (req, res) => {
    let { title, author, genre, dscrptn ,isbn } = req.body;
    const result = await isbnFind(req.body.title, req.body.author);
    let existing = await bookModel.findOne({isbn: result});
    if (existing) {
        req.session.message = "Book already exists!" ;
    }else{
        try {
            let addedBook = await bookModel.create({
                title,
                author,
                genre,
                dscrptn,
                isbn:result
            });
            req.session.message = 'Book Added Successfully!';
        } catch (err) {
            req.session.message = "Book Not Created! Information too short or incomplete!";
        }
    }
    res.redirect('/addbook');

})
app.get('/review',auth, (req, res) => {
    res.render('writeReview');
})
app.post('/review', async (req, res) => {
    let { review } = req.body;
    let yourreview = reviewModel.create({
        review
    })
    res.send("review posted");
})
app.listen(3000);