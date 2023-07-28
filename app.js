if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
// console.log(process.env.SECRET)
const express = require('express');
const session = require('express-session')
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize')
const flash = require('connect-flash')
const ejsMate = require('ejs-mate')
const Joi = require('joi')
// const morgan = require('morgan')
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const passport =  require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const Review = require('./models/review')
const methodoverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const { nextTick } = require('process');
const MongoStore = require('connect-mongo');
const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error',console.error.bind(console,'mongo connection error:'))
db.once('open',function(){
    console.log("mongo Connection done");
})
const app = express();
// app.use(morgan('tiny'))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,'public')))
const store = MongoStore.create({
    mongoUrl:dbUrl  ,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionConfig = {
    store,
    name:'session',
    secret: 'thisshouldbeabettersecret',
    resave:false,
    saveUnitialized: true,
    cookie:{
        httpOnly:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize())
app.use(passport.session())

  
app.use(mongoSanitize())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodoverride('_method'))
app.use((req,res,next) =>{
    // console.log(req.session)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error= req.flash('error')
    next()
})

app.use("/",userRoutes)
app.use("/campgrounds",campgroundRoutes)
app.use("/campgrounds/:id/reviews",reviewRoutes)
const validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body)
    if(error){
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressError(msg,400)
    }else{
        next();
    }
    
}
const validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

app.get('/',(req,res)=>{
    res.render('campgrounds/home')
})

app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req,res) =>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{ $pull: { reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))
app.all('*',(req,res,next) =>{
    next(new ExpressError('Page not found ',404))
})

app.use((err,req,res,next)=>{
    const  {statusCode =500,message = 'Something Went Wrong'} = err 
    if(!err.message) err.message='Oh No! Something Went Wrong'                                  
    res.status(statusCode).render('error',{err});
    // res.send("something went wrong!!")
})

app.listen(3000,() =>{
    console.log("Serving on port 3000!!!")
})

