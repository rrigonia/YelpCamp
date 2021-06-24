const mongoose = require('mongoose');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelper');
const cities = require('./cities')

mongoose.connect('mongodb://localhost:27017/yelp-cp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.set('useFindAndModify', false);

// Error Check to mongoose
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i <= 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40) + 20
        const camp = new Campground({
            author: "60d21a603368de2804fe6233",
            title: `${sample(places)} ${sample(descriptors)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/rrigoni/image/upload/v1624459247/YelpCamp/rmetaesghmzqjdifmofj.jpg',
                    filename: 'YelpCamp/rmetaesghmzqjdifmofj'
                },
                {
                    url: 'https://res.cloudinary.com/rrigoni/image/upload/v1624459251/YelpCamp/y6sfon0saueyivh01ovw.jpg',
                    filename: 'YelpCamp/y6sfon0saueyivh01ovw'
                }
            ],
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minima culpa ipsa vero exercitationem ea consectetur, nostrum beatae at quia eos expedita est ad nesciunt numquam',
            price
        });
        await camp.save()
    }
};


seedDB().then(() => {
    mongoose.connection.close();
});