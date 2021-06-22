const express = require('express');
const router = express.Router();
const wrapError = require("../utils/wrapError");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const ObjectID = require('mongodb').ObjectID;
const isLoggedIn = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        return next();
    }
};


router.get("/", wrapError(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
})
);

router.get("/new", isLoggedIn, (req, res, next) => {
    res.render("campgrounds/new");
});

router.post("/", isLoggedIn, validateCampground, wrapError(async (req, res, next) => {
    const { campground } = req.body;
    const newcamp = new Campground(campground);
    await newcamp.save();
    req.flash('success', 'Successfully created a Campground!');
    res.redirect(`/campgrounds/${newcamp._id}`);
}));

router.delete("/:id", isLoggedIn, wrapError(async (req, res, next) => {
    const { id } = req.params;
    const delCamp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a Campground!');
    res.redirect("/campgrounds");
}));

router.put("/:id", isLoggedIn, validateCampground, wrapError(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated a Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id/edit", isLoggedIn, wrapError(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds');
    };
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/edit", { campground });
}));

router.get("/:id", wrapError(async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds');
    };
    const campground = await Campground.findById(id).populate("reviews");
    if (!campground) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/show", { campground });
}));

module.exports = router;