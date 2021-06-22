const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapError = require("../utils/wrapError");
const Campground = require("../models/campground");
const Review = require("../models/review");

const { isLoggedIn, isReviewAuthor, validatedReview } = require('../middleware');







router.post("/", isLoggedIn, validatedReview, wrapError(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new reivew!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapError(async (req, res, next) => {

    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'The review has beend deleted!')
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;