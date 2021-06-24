const Campground = require("../models/campground");
const ObjectID = require('mongodb').ObjectID;
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res, next) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newcamp = new Campground(req.body.campground);
    newcamp.geometry = geodata.body.features[0].geometry;
    newcamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newcamp.author = req.user._id;
    await newcamp.save();
    console.log(newcamp);
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
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }
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

