var express = require('express');
var router = express.Router();
var mongo = require('../lib/mongo.js');
var app = require('../lib/app.js');

router.get("/coach", function(req, res, next){
  mongo.displayCoachesTeams(req).then(function(teams){
    res.render("lyneup/coach/index", {teams: teams})
  })
})

router.get('/join-league', function(req, res, next){
  if(req.session.role === "coach"){
    mongo.findAllLeaguesAndDivisions(req, res).then(function(leagues){
      res.render("lyneup/coach/join-league", {leagues: leagues})
    });
  } else {
    res.redirect('/');
  }
})

router.get('/league/:leagueid/division/:divisionid/join-division', function(req, res, next){
  res.render('lyneup/coach/join-division', {divisionid: req.params.divisionid});
})

router.get('/team/:id', function(req, res, next){
  mongo.findMyTeam(req).then(function(team){
    if(team.players.length !=0){
      mongo.findPlayersForTeam(team).then(function(players){
              res.render('lyneup/coach/team', {team: team, players: players})
      })
    } else {
    mongo.findPlayersForTeam(team).then(function(players){
            res.render('lyneup/coach/team', {team: team})
        })
    }
  })

})

router.get("/player/:id/edit", function(req, res, next){
  mongo.findIndividualPlayer(req).then(function(player){
      res.render('lyneup/coach/player', {aaplayer: player})
  })
})

router.post('/league/:leagueid/division/:divisionid/join-division', function(req, res, next){
  mongo.createTeam(req).then(function(){
      res.redirect('/');
  });
})

module.exports = router;
