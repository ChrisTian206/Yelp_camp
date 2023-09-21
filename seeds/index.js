const mongoose = require('mongoose');
const cities = require('./cities');
const campGround = require('../models/campground')
const { places, descriptors } = require('./seedHelpers');
const axios = require('axios');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
db.once('open', function () {
    console.log("mongo Connection open!")
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}


const seedDB = async () => {
    await campGround.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new campGround({
            author: '64bec6e9f970ecd997f22476',
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dfcsqxxfx/image/upload/v1691437200/Yelp-Camp/kzh52lxplrox2k293d1x.jpg',
                    filename: 'Yelp-Camp/kzh52lxplrox2k293d1x'
                },
                {
                    url: 'https://res.cloudinary.com/dfcsqxxfx/image/upload/v1691437200/Yelp-Camp/aituzfwbnw25dnuqc7zj.jpg',
                    filename: 'Yelp-Camp/aituzfwbnw25dnuqc7zj'
                },
                {
                    url: 'https://res.cloudinary.com/dfcsqxxfx/image/upload/v1691437200/Yelp-Camp/frwncfneqifidzrlkv1x.jpg',
                    filename: 'Yelp-Camp/frwncfneqifidzrlkv1x'
                },
                {
                    url: 'https://res.cloudinary.com/dfcsqxxfx/image/upload/v1691437200/Yelp-Camp/imbry3idowysawdxy3ta.jpg',
                    filename: 'Yelp-Camp/imbry3idowysawdxy3ta'
                }
            ],
            description: 'This is a beautiful campground. I like the rivers, mountains, grass, and flowers. It truly heals me from the inside out.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            }
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })


//Random image generator
//https://random.imagecdn.app/500/150