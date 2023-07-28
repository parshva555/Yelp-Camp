const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db = mongoose.connection;
db.on('error',console.error.bind(console,'mongo connection error:'))
db.once('open',function(){
    console.log("mongo Connection done");
})

const sample = (array) => array[Math.floor(Math.random()*array.length)]


const seedDb = async () => {
    await Campground.deleteMany({});
    for ( let i=0;i<200;i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
          //Your user Id
            author:'64bccafa6eacdb4a0165b472',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nostrum rerum tempore commodi suscipit? Culpa fugit impedit suscipit neque adipisci accusantium ut et saepe corrupti quae provident iste possimus, at pariatur.',
            price,
            geometry:{
              type:'Point',
              coordinates:[
                cities[random1000].longitude,
                cities[random1000].latitude 
            ]
            },
            image: [
            {
                url: 'https://res.cloudinary.com/dhnebcqyy/image/upload/v1690221097/YelpCamp/quqfjbhgknumntqem0oa.webp',
                filename: 'YelpCamp/quqfjbhgknumntqem0oa'
              },
              {
                url: 'https://res.cloudinary.com/dhnebcqyy/image/upload/v1690221097/YelpCamp/xvyjcfz48j90qrs2kbz1.jpg',
                filename: 'YelpCamp/xvyjcfz48j90qrs2kbz1'
              },
              {
                url: 'https://res.cloudinary.com/dhnebcqyy/image/upload/v1690221098/YelpCamp/o1h0qt6y31lp08ulv5jd.jpg',
                filename: 'YelpCamp/o1h0qt6y31lp08ulv5jd'
              }
            ]
        })
        await camp.save();
    }
}
seedDb().then(() => {
    mongoose.connection.close();
});