const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const campgrounds = require('../controllers/campgrounds')
const {isLoggedIn,isAuthor,validateCampground}= require('../middleware');
const campground = require('../models/campground');
const multer  = require('multer')
const {storage} =  require('../cloudinary/index')  // no need to specify index since node already seeks for index if left blank
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))
// router.get('/', catchAsync(campgrounds.index))
// router.post('/',isLoggedIn,validateCampground,catchAsync(campgrounds.createCampground))

// router.get('/:id',catchAsync(campgrounds.showCampground))
router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))

// router.put('/:id',isLoggedIn,isAuthor,validateCampground,catchAsync(campgrounds.updateCampground))
// router.delete('/:id',isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))
module.exports = router