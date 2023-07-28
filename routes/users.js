const express= require('express');
const router = express.Router();
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const { storeReturnTo } = require('../middleware');
const {remove} = require('../models/user');
const passport = require('passport');

const users = require('../controllers/users')
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))


// router.get('/register',users.renderRegister)
// router.post('/register',catchAsync(users.register))
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo,passport.authenticate('local',{failureFlash: true,failureRedirect:'/login'}),users.login) 
// router.get('/login',users.renderLogin)
// router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash: true,failureRedirect:'/login'}),users.login)  
router.get('/logout', users.logout); 
module.exports=router;