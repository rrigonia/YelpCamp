const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const wrapError = require("../utils/wrapError");
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })


router.route('/')
    .get(wrapError(campgrounds.index))
    // .post(isLoggedIn, validateCampground, wrapError(campgrounds.createCampground));
    .post(upload.single('image'), (req, res) => {
        console.log(req.body, req.file);
        res.send("IT Worked ?!")
    });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(wrapError(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, wrapError(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, wrapError(campgrounds.delete));

router.get("/:id/edit", isLoggedIn, isAuthor, wrapError(campgrounds.renderEditForm));


module.exports = router;