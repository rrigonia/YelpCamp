if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require("./utils/ExpressError");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {securityConfig} = require('./security/securitySrcs');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');
// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-cp";

// Mongoose
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
});



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database Connected");
});
// Ends Mongoose

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({replaceWith: '_'}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoStore({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60,
	crypto: {secret}
});



store.on('error', function(e){
	console.log("SESSION ERROR", e);
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};

app.use(session(sessionConfig)); //have to be before the passport.init
app.use(flash());
app.use(helmet());
// Config helmet security
app.use(helmet.contentSecurityPolicy(securityConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.currentUser = req.user;
	next();
})

// Routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get("/", (req, res, next) => {
	res.render("home");
});

app.get("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = "Oh No !! Something Went Wrong :( !!";
	res.status(status).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
