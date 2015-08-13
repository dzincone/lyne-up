var bcrypt = require('bcrypt');
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI);
mongoose.set('debug', true);

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    first_name: String,
    last_name: String,
    address: {},
    role: String
  });

var leaguesSchema = new mongoose.Schema({
    league_owner: String,
    league_name: String,
    address: {},
    game_type: String,
    game_length: String,
    divisions: [],
    coaches: [],
    facilities: []
  });

  var divisionSchema = new mongoose.Schema({
    division_name: String,
    gender: String,
    grade_level: String,
    skill_level: String,
    max: String,
    teams: []
  });

  var teamsSchema = new mongoose.Schema({
    team_name: String,
    coach: String,
    assistant: String,
    players: [],
  });

  var playersSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    jersey: String
  })

var users =  mongoose.model("users", userSchema);
var leagues =  mongoose.model("leagues", leaguesSchema);
var divisions = mongoose.model("divisions", divisionSchema);
var teams = mongoose.model('teams', teamsSchema);
var players = mongoose.model('players', playersSchema);

module.exports = {

  newAccount: function(data, req, res) {
    var hash = bcrypt.hashSync(data.password, 8);
    return users.findOne({username: req.body.username}).then(function(newdata){
      var errors = [];
        if(newdata){
          errors.push("This username has already been used");
          res.render('lyneup/create-account', {errors: errors});
        }
        else {
          return users.create({username: data.username,
                        password: hash,
                        first_name: req.body.first,
                        last_name: req.body.last,
                        address: {street: req.body.street,
                                  city: req.body.city,
                                  state: req.body.state,
                                  zip: req.body.zip},
                        role: req.body.role}).then(function(){
                          req.session.username = req.body.username;
                          req.session.name = req.body.first;
                          req.session.role = req.body.role;
                          res.redirect('/')
                        });
        }
    });
  },

  login: function(data, req, res) {
    return users.findOne({username: data.username}).then( function(dbdata){
      if(dbdata)
      var crypt = bcrypt.compareSync(data.password, dbdata.password);
        if(crypt) {
          req.session.username = dbdata.username;
          req.session.name = dbdata.first_name;
          req.session.role = dbdata.role;
          res.redirect('/');
      } else {
          var errors = [];
          errors.push("Unable to find username/password combination");
          res.render('lyneup/login', {errors: errors});
        }
  });
},

  findUser: function(req){
    return users.findOne({username: req.session.username})
  },

  findLeaguesForOwner: function(user){
    return leagues.find({league_owner: user.username})
  },

  findDivisionsForOwner: function(){
    return divisions.find();
  },

  findSpecificDivisionsForOwner: function(array) {
    return divisions.find({_id: {$in: array}})
  },

  findAllLeaguesAndDivisions: function(req, res){
    var array = [];
    return leagues.find().then(function(leagues){
      return divisions.find().then(function(data){
        if(data != 0){
            for(var i = 0; i < leagues.length; i++){
              for(var j = 0; j < leagues[i].divisions.length; j++){
                for(var k = 0; k < data.length; k++){
                  if(leagues[i].divisions[j].toString() === data[k]._id.toString()){
                    array.push(data[k]._id)
                  }
                }
              }
              return divisions.find({_id: {$in: array}}).then(function(divisions){
                res.render("lyneup/coach/join-league", {user: req.session.username, name: req.session.name, leagues: leagues, divisions: divisions})})}
        } else {
          res.render("lyneup/coach/join-league", {
            user: req.session.username, name: req.session.name, leagues: leagues
          })
        }
      })
    })
  },

  insertLeague: function(req) {
    return leagues.findOneAndUpdate({league_name: req.body.name},
                            {league_owner: req.session.username,
                            league_name: req.body.name,
                            address: {street: req.body.street,
                                      city: req.body.city,
                                      state: req.body.state,
                                      zip: req.body.zip},
                            game_type: req.body.type,
                            game_length: req.body.length,
                            divisons: [],
                            coaches: [],
                            facilities: []},
                            {"upsert": true})
  },

  checkLeagues: function(req) {
    return leagues.find({_id: req.params.id})
  },

  checkOneLeague: function(req) {
    return leagues.findOne({_id: req.params.id})
  },

  updateLeague: function(req){
    return leagues.findOneAndUpdate({_id: req.params.id},
                {$set:{league_name: req.body.name,
                      address: {street: req.body.street,
                                city: req.body.city,
                                state: req.body.state,
                                zip: req.body.zip},
                      game_type: req.body.type,
                      game_length: req.body.length}})
  },

  updateDivision: function(req){
    return divisions.findOneAndUpdate({_id: req.params.id},
                                      {$set: {division_name: req.body.name,
                                            gender: req.body.gender,
                                            grade_level: req.body.grade,
                                            skill_level: req.body.skill,
                                            max: req.body.max}})
  },

  removeLeague: function(req){
    return leagues.remove({_id: req.params.id})
  },

  createDivision: function(req){
    return divisions.create({division_name: req.body.name,
                                gender: req.body.gender,
                                grade_level: req.body.grade,
                                skill_level: req.body.skill,
                                max: req.body.max}).then(function(division){
      return leagues.findOneAndUpdate({_id: req.params.id},
                              {$addToSet: {divisions: division._id}})})
  },

  removeDivision: function(req){
    return leagues.findOneAndUpdate({_id: req.params.id},
                                    {$pop: {divisions:req.params.divisionid}})
  },

  findDivisionToUpdate: function(req){
    return divisions.findOne({_id: req.params.divisionid})
  },

  findTeams: function(){
    return teams.find();
  },

  createTeam: function(req) {
    var x = 0;
    var arr = [];
    var promiseArray = [];
    for(var i = 0; i < req.body.count; i++){
      x++
      req.body.first_name = req.body["player" + x.toString() + "_first_name"]
      req.body.last_name = req.body["player" + x.toString() + "_last_name"]
      req.body.number = req.body["player" + x.toString() + "_number"]
      promiseArray.push(players.create({first_name: req.body.first_name,                  last_name: req.body.last_name, jersey: req.body.number})        .then(function(player){
          return teams.findOneAndUpdate({
            team_name: req.body.team,
            coach: req.session.username
          },
          {
            team_name: req.body.team,
            coach: req.session.username,
            assistant: req.body.assistant,
            $addToSet: {players: player._id}
          },
            {upsert: true, new: true}
          )
          }).then(function(team){
            return divisions.findOneAndUpdate({_id: req.params.divisionid},
                                      {$addToSet: {teams: team._id}},
                                      {"upsert": true})
          }))
      }
    return Promise.all(promiseArray);
  },

  findMyTeam: function(req){
    return teams.findOne({_id: req.params.id})
  },

  findPlayersForTeam: function(team){
    var array = [];
    for(var i = 0; i < team.players.length; i++){
      array.push(team.players[i])}
    return players.find({_id: {$in: array}})
  },

  findDivisionForOneTeam: function(req,teams) {
    var array = [];
    for(var i = 0; i < teams.length; i++){
      array.push(teams[i]._id)}
    return divisions.find({teams: {$in: array}})
  },

  displayCoachesTeams: function(req) {
    var array = [];
    return users.findOne({username: req.session.username}).then(function(user){
      return teams.find().then(function(allteams){
        for(var i = 0; i < allteams.length; i++){
          if(user.username.toString() === allteams[i].coach.toString()){
            array.push(allteams[i].coach)}}})
    }).then(function(){
      return teams.find({coach: {$in: array}})})
  },

  findIndividualPlayer: function(req){
    return players.findOne({_id: req.params.id})
  }
};
