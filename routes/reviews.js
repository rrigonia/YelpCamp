const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews')
const wrapError = require("../utils/wrapError");


const { isLoggedIn, isReviewAuthor, validatedReview } = require('../middleware');

router.post("/", isLoggedIn, validatedReview, wrapError(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapError(reviews.delete));

module.exports = router;