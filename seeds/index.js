if (process.env.NODE_ENV !== "production") {
	require('dotenv').config();
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelper');
const cities = require('./cities');


const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-cp";

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
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
            author: "60d52155d2571e0015334f06",
            title: `${sample(places)} ${sample(descriptors)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]
            },
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2FtcGdyb3VuZHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                    filename: 'YelpCamp/rmetaesghmzqjdifmofj'
                },
                {
                    url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2FtcGdyb3VuZHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
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