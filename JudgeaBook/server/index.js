// require('dotenv').config({ path: require('find-config')('.env') });
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('find-config')('.env') });
}
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
const check = require('./middleware/checkuser');
app.use(session({
    secret: process.env.Some_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(check)
app.set("views", path.join(__dirname, "../app/views"))

app.get('/',async (req,res)=>{
    let book = await bookModel.find();
    res.render('explore',{book})
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
            let token = jwt.sign({ email:email,user:createdUser._id }, secret)
            res.cookie("token", token);
            res.redirect('/profile');

        })
    });
})

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/');
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email })
    if (!user) return res.redirect('/signup');
    else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ email: user.email }, secret)
                res.cookie("token", token);
                res.redirect('/profile');
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

app.post('/book/:isbn',auth, async (req, res) => {
    let { content,like } = req.body;
    try{
        let user = await userModel.findOne(req.user);
        let book = await bookModel.findOne({isbn:req.params.isbn})
        if(user){
            let yourreview = await reviewModel.create({
                content,
                book: book._id,
                user: user._id,
                like,
            })
            user.reviews.push(yourreview._id);
            await user.save();
            return res.redirect(`/book/${req.params.isbn}`)

        }
        
    }catch(err){
        return res.status(401).send(`Something went wrong!${err.message}`)
    }

    res.send("review posted");
})
app.get('/book/:isbn',async (req,res)=>{
    let book = await bookModel.findOne({isbn:req.params.isbn})
    let review = await reviewModel.find({book:book._id});
    let username = await userModel.findOne({id:review.user}).select("username");
    res.render('bookpage',{book,review,username});
    // res.render('bookpage',{book});
})
app.get('/profile',auth, async (req,res)=>{
    let user = await userModel.findOne(req.user).select('-password').populate('reviews');
    let findbook = async ()=>{
        for(const rw of user.reviews){
            let book = await bookModel.findOne({_id:rw.book});
            return book.title;
        }
    }
    let bookname = await findbook();
    res.render('profile',{user,bookname});
})
app.listen(3000);