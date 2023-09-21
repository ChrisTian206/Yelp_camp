//initiate app.js based on env.mode
// if in dev mode, run seeds for MongoDB
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//back-end server
const express = require('express');
const app = express();
const path = require('path');

//mongoDB
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo')(session);

//for delete and update requests
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');   // user auth
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize') //prevent injection
const ExpressError = require('./utils/ExpressError')
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'

//routers
const campgroundRoutes = require('./routes/campgrounds');
const userRoute = require('./routes/users')
const reviewsRoutes = require('./routes/reviews')

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
db.once('open', function () {
    console.log("mongo Connection open!")
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const secret = process.env.SECRET || 'thiscanbeabettersecret'

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("Session store error", e)
})

// session expired is calculated in ms. This is why 1s is represented as 1000.
const sessionConfig = {
    store: store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session())//session must be used before passport.session()
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundRoutes)
app.use('/', userRoute)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home')
})


//This catches all mis-spelled html in our site.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong...';
    console.dir(err)
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});


