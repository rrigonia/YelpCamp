const Campground = require("../models/campground");
const ObjectID = require('mongodb').ObjectID;

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res, next) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    const { campground } = req.body;
    const newcamp = new Campground(campground);
    newcamp.author = req.user._id;
    await newcamp.save();
    req.flash('success', 'Successfully created a Campground!');
    res.redirect(`/campgrounds/${newcamp._id}`);
};

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds');
    };
    const campground = await Campground.findById(id).populate({
        path: "reviews", populate: { path: 'author' }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds');
    };
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that Campground.');
        return res.redirect('/campgrounds')
    };
    res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated a Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const delCamp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a Campground!');
    res.redirect("/campgrounds");
};

