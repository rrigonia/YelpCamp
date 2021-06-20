const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const wrapError = require('./utils/wrapError');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');
const Review = require('./models/review')


mongoose.connect('mongodb://localhost:27017/yelp-cp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.set('useFindAndModify', false);

// Error Check to mongoose
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Validating my Put and Post with JOI
const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else{
        return next();
    }
}

const validatedReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else{
        return next();
    }
}

app.get('/', (req,res,next) => {
    res.redirect('/campgrounds')
});

app.get('/campgrounds', wrapError(async (req,res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}));

app.get('/campgrounds/new',(req,res,next) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, wrapError(async(req,res,next) => {
    const { campground } = req.body;
    const newcamp = new Campground(campground);
    await newcamp.save();
    res.redirect(`/campgrounds/${newcamp._id}`);
}));

app.delete('/campgrounds/:id', wrapError(async(req,res,next) => {
    const { id } = req.params;
    const delCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));


app.put('/campgrounds/:id',validateCampground, wrapError(async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))


app.get('/campgrounds/:id/edit', wrapError(async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}));

app.get('/campgrounds/:id', wrapError(async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground});
}));

app.get('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.post('/campgrounds/:id/reviews',validatedReview, wrapError(async(req,res,next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

    res.send("You made it")
}))

app.use((err,req,res,next) => {
    const {status = 500} = err;
    if(!err.message) err.message = 'Oh No !! Something Went Wrong :( !!'
    res.status(status).render('error', {err});
});

app.listen(3000, () => {
    console.log("Listening to port 3000")
})