const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const wrapError = require("../utils/wrapError");
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get(wrapError(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapError(campgrounds.createCampground));


router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(wrapError(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapError(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, wrapError(campgrounds.delete));

router.get("/:id/edit", isLoggedIn, isAuthor, wrapError(campgrounds.renderEditForm));


module.exports = router;