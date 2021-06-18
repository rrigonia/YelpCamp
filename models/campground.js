const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    location: String,
    price: Number,
    description: String,
    image: String

})

module.exports = mongoose.model('Campground',campgroundSchema)
