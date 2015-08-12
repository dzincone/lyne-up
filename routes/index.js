var express = require('express');
var router = express.Router();
var mongo = require('../lib/mongo.js');
var app = require('../lib/app.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.username){
   mongo.findUser(req).then(function(user){
     if(user.role === "leagueowner"){
       mongo.findLeaguesForOwner(user).then(function(leagues){
          if(leagues.length != 0){
            var array = [];
            mongo.findDivisionsForOwner().then(function(data){
              if(data.length != 0){
                for(var i = 0; i < leagues.length; i++){
                  for(var j = 0; j < leagues[i].divisions.length; j++){
                    for(var k = 0; k < data.length; k++){
                    if(leagues[i].divisions[j].toString() === data[k]._id.toString()){
                      array.push(data[k]._id)
                    }
                  }
                } mongo.findSpecificDivisionsForOwner(array).then(function(divisions){
                    res.render("lyneup/league-owner/index", {user: req.session.username, name: req.session.name, leagues: leagues, divisions: divisions})
                })
              }
            } // ends data.length condition
            else {
                res.render("lyneup/league-owner/index", {user: req.session.username, name: req.session.name, leagues: leagues})
              }
            }) //ends findSpecificDivisionsForOwner promise
          }  //ends leagues.length condition
          else {
            res.render("lyneup/league-owner/index", {user: req.session.username, name: req.session.name})
          }
        }) // ends findLeaguesForOwner promise
     } //ends user.role condition
     else if(user.role === "coach"){
       mongo.findTeams().then(function(allteams){
         if(allteams.length != 0){
           mongo.displayCoachesTeams(req).then(function(teams){
          console.log(teams)
            if(teams.length != 0){
              mongo.findDivisionForOneTeam(req, teams).then(function(divisions){
                console.log(divisions)
                res.render("lyneup/coach/index", {user: req.session.username, name: req.session.name, teams: teams, divisions: divisions})
              })

            } else {
              res.render("lyneup/coach/index", {user: req.session.username, name: req.session.name})
            }
           })
         } else {
             res.render("lyneup/coach/index", {user: req.session.username, name: req.session.name})
         }
       })
     }
   }) // ends findUser promise
 } //ends req.session condition
   else {
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
