var express = require('express');
var router = express.Router();
var mongo = require('../lib/mongo.js');
var app = require('../lib/app.js');

router.get('/create-league', function(req, res, next){
  if(req.session.role === "leagueowner"){
      res.render('lyneup/league-owner/create-league', {user: req.session.username, name: req.session.name})
  } else {
    res.redirect('/');
  }
})

router.post('/create-league', function(req, res, next){
  if(req.session.username){
    mongo.insertLeague(req).then(function(){
      res.redirect("/")
    })
  }
  else {
    res.redirect('/')
  }
})

router.get('/league/:id', function(req, res, next){
  mongo.checkLeagues(req).then(function(league){
    if(req.session.username === league[0].league_owner){
      res.render('lyneup/league-owner/league', {user: req.session.username, name: req.session.name, league: league[0]})
    }
  })
})

router.post('/league/:id', function(req, res, next){
  var errors = []
  app.checkLeagueEditErrors(req, res, errors);
  if(errors.length != 0){
    mongo.checkLeagues(req).then(function(league){
        res.render('lyneup/league-owner/league', {user: req.session.username, name: req.session.name, errors: errors, league: league[0], info: req.body});
    })
  } else {
    mongo.updateLeague(req).then(function(){
    res.redirect('/');
    })
  }
})

router.get('/league/:id/create-division', function(req, res, next){
  mongo.checkOneLeague(req).then(function(user){
    if(req.session.username === user.league_owner){
        res.render('lyneup/league-owner/create-division', {user: req.session.username, name: req.session.name, _id: req.params.id});
    } else {
      res.redirect('/');
    }
  })
})

router.get('/league/:id/division/:divisionid', function(req, res, next){
  mongo.checkOneLeague(req).then(function(user){
    if(req.session.username === user.league_owner){
    mongo.findDivisionToUpdate(req).then(function(data){
      res.render('lyneup/league-owner/division', {data: data, user: req.session.username, name: req.session.name, _id: req.params.id})
    })
  }
  })
})

router.post('/update-division/:id', function(req, res, next){
  var errors = [];
  app.checkDivisionErrors(req, res, errors);
  if(errors != 0){
    mongo.findDivisionToUpdate(req).then(function(data){
      res.render('lyneup/league-owner/division', {data: data, user: req.session.username, name: req.session.name, _id: req.params.id, errors: errors, info: req.body})
    })
  } else {
    mongo.updateDivision(req).then(function(data){
      res.redirect('/');
  })
  }
})

router.get("/league/:id/schedule", function(req, res, next){



})

router.post('/create-division/:id', function(req, res, next){
  var errors = [];
  app.checkDivisionErrors(req, res, errors);
  if(errors != 0) {
    res.render('lyneup/league-owner/create-division', {user: req.session.username, name: req.session.name, errors: errors})
  } else {
    mongo.createDivision(req).then(function(){
      res.redirect('/');
    })
  }
})

router.post('/league/:id/division/remove/:divisionid', function(req, res, next){
  mongo.removeDivision(req).then(function(){
    res.redirect('/');
  })
})

router.post('/league/remove/:id', function(req, res, next){
  mongo.removeLeague(req).then(function(data){
    res.redirect('/');
  })
})
module.exports = router;
