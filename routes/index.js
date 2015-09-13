var express = require('express');
var router = express.Router();
var mongo = require('../lib/mongo.js');
var app = require('../lib/app.js');

// when a user goes to "/"
// if they are logged in, redirect them to /leagueowner or /coach

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.username){
   mongo.findUser(req).then(function(user){
    if(user.role === "leagueowner"){
      res.redirect('/leagueowner');
    }
    else if(user.role === "coach"){
      res.redirect('/coach');
    }
    else if(user.role === "regular"){
      res.redirect('/regular');
    }
    })
  } else {
      res.render('index', { title: 'Express' });
  }
});

router.get('/about', function(req, res, next) {
  res.render('index')
})

router.get('/prices', function(req, res, next) {
  res.render('index')
})

router.get('/league-features', function(req, res, next) {
  res.render('index')
})

router.get('/upcoming-events', function(req, res, next) {
  res.render('index')
})

router.get('/contact-us', function(req, res, next) {
  res.render('index')
})

router.get('/create-account', function(req, res, next){
  res.render('lyneup/create-account')
})

router.post('/create-account', function(req, res, next) {
    app.checkErrors(req, res);
    mongo.newAccount(req.body, req, res)
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
    mongo.login(req.body, req, res);
  }
  else {
    res.redirect('/')
  }
})

router.get('/logout', function(req, res, next) {
  req.session = null;
  res.redirect("/");
})
module.exports = router;
