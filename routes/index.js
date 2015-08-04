var express = require('express');
var router = express.Router();
var mongo = require('../lib/mongo.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/about', function(req, res, next) {
  res.render('index')
})

router.get('/leagues', function(req, res, next) {
  res.render('index')
})

router.get('/players', function(req, res, next) {
  res.render('index')
})

router.get('/create-account', function(req, res, next){
  res.render('lyneup/create-account')
})

router.post('/create-account', function(req, res, next) {
  var errors = [];
  if(req.body.username === ""){
    errors.push("Username cannot be left blank")
  }
  if(req.body.password === ""){
    errors.push("Password cannot be left blank")
  }
  if(req.body.confirm === ""){
    errors.push("You must confirm your password")
  }
  if(req.body.password != req.body.confirm){
    errors.push("Your passwords do not match, please re-enter them carefully")
  }
  if(errors.length === 0){
    mongo.newAccount(req.body).then(function(){
      res.redirect('/');
    })
  } else {
    res.render('lyneup/create-account', {errors: errors, data: req.body})
  }
})

router.get('/login', function(req, res, next){
  res.render('lyneup/login');
})

router.post('/login', function(req, res, next){
  var errors = [];
  if(req.body.username === ""){
    errors.push("Username cannot be left blank")
  }
  if(req.body.password === ""){
    errors.push("Password cannot be left blank")
  }
  if(errors.length === 0){
    mongo.login(req.body, res).then(function(){

    })
  }
  else {
    res.render('lyneup/login', {errors: errors})
  }
})
module.exports = router;
