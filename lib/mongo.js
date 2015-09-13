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
    league_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'},
    league_name: String,
    address: {},
    game_type: String,
    game_length: String,
    divisions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Divisions'}],
    coaches: [],
    facilities: []
  });

  var divisionSchema = new mongoose.Schema({
    division_name: String,
    gender: String,
    grade_level: String,
    skill_level: String,
    max: String,
    teams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teams'
    }]
  });

  var teamsSchema = new mongoose.Schema({
    team_name: String,
    coach: String,
    assistant: String,
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Players'
    }],
  });

  var playersSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    jersey: String
  })

var Users =  mongoose.model("Users", userSchema);
var Leagues =  mongoose.model("Leagues", leaguesSchema);
var Divisions = mongoose.model("Divisions", divisionSchema);
var Teams = mongoose.model('Teams', teamsSchema);
var Players = mongoose.model('Players', playersSchema);

module.exports = {

  newAccount: function(data, req, res) {
    var hash = bcrypt.hashSync(data.password, 8);
    return Users.findOne({username: req.body.username}).then(function(newdata){
      var errors = [];
        if(newdata){
          errors.push("This username has already been used");
          res.render('lyneup/create-account', {errors: errors});
        }
        else {
          return Users.create({username: data.username,
                        password: hash,
                        first_name: req.body.first,
                        last_name: req.body.last,
                        address: {street: req.body.street,
                                  city: req.body.city,
                                  state: req.body.state,
                                  zip: req.body.zip},
                        role: req.body.role}, {new: true}).then(function(user){
                          console.log(user);
                          req.session.username = user._id;
                          req.session.name = req.body.first;
                          req.session.role = req.body.role;
                          res.redirect('/')
                        });
        }
    });
  },

  login: function(data, req, res) {
    return Users.findOne({username: data.username}).then( function(dbdata){
      if(dbdata)
      var crypt = bcrypt.compareSync(data.password, dbdata.password);
        if(crypt) {
          req.session.username = dbdata._id;
          req.session.name = dbdata.first_name;
          req.session.role = dbdata.role;
          console.log("last step")
          res.redirect('/');
      } else {
          var errors = [];
          errors.push("Unable to find username/password combination");
          res.render('lyneup/login', {errors: errors});
        }
  });
},

  findUser: function(req){
    return Users.findOne({_id: req.session.username})
  },

  findLeaguesForOwner: function(req){
      return Leagues.find().populate('league_owner divisions')
  },

  findDivisionsForOwner: function(){
    return Divisions.find();
  },

  findSpecificDivisionsForOwner: function(array) {
    return Divisions.find({_id: {$in: array}})
  },

  findAllLeaguesAndDivisions: function(req, res){
    return Leagues.find().then(function(leagues){
      return Divisions.find().then(function(data){
        var array = [];
        if(data != 0){
            for(var i = 0; i < leagues.length; i++){
              leagues[i].alldivisions = [];
              for(var j = 0; j < leagues[i].divisions.length; j++){
                for(var k = 0; k < data.length; k++){
                  if(leagues[i].divisions[j].toString() === data[k]._id.toString()){
                    leagues[i].alldivisions.push(data[k])
                  }
                }
              }
            }
        return leagues
      }
      })
    })
  },

  insertLeague: function(req) {
    return Leagues.findOneAndUpdate({league_name: req.body.name},
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
    return Leagues.find({_id: req.params.id})
  },

  checkOneLeague: function(req) {
    return Leagues.findOne({_id: req.params.id})
  },

  updateLeague: function(req){
    return Leagues.findOneAndUpdate({_id: req.params.id},
                {$set:{league_name: req.body.name,
                      address: {street: req.body.street,
                                city: req.body.city,
                                state: req.body.state,
                                zip: req.body.zip},
                      game_type: req.body.type,
                      game_length: req.body.length}})
  },

  updateDivision: function(req){
    return Divisions.findOneAndUpdate({_id: req.params.id},
                                      {$set: {division_name: req.body.name,
                                            gender: req.body.gender,
                                            grade_level: req.body.grade,
                                            skill_level: req.body.skill,
                                            max: req.body.max}})
  },

  removeLeague: function(req){
    return Leagues.remove({_id: req.params.id})
  },

  createDivision: function(req){
    return Divisions.create({division_name: req.body.name,
                                gender: req.body.gender,
                                grade_level: req.body.grade,
                                skill_level: req.body.skill,
                                max: req.body.max}).then(function(division){
      return Leagues.findOneAndUpdate({_id: req.params.id},
                              {$addToSet: {divisions: division._id}})})
  },

  removeDivision: function(req){
    return Leagues.findOneAndUpdate({_id: req.params.id},
                                    {$pop: {divisions:req.params.divisionid}})
  },

  findDivisionToUpdate: function(req){
    return Divisions.findOne({_id: req.params.divisionid})
  },

  findTeams: function(){
    return Teams.find();
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
      promiseArray.push(Players.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        jersey: req.body.number
      }).then(function(player){
          return Teams.findOneAndUpdate({
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
            return Divisions.findOneAndUpdate({_id: req.params.divisionid},
                                      {$addToSet: {teams: team._id}},
                                      {upsert: true})
          }))
      }
    return Promise.all(promiseArray);
  },

  findMyTeam: function(req){
    return Teams.findOne({_id: req.params.id})
  },

  findPlayersForTeam: function(team){
    var array = [];
    for(var i = 0; i < team.players.length; i++){
      array.push(team.players[i])}
    return Players.find({_id: {$in: array}})
  },

  findDivisionForOneTeam: function(req,teams) {
    var array = [];
    for(var i = 0; i < teams.length; i++){
      array.push(teams[i]._id)}
    return Divisions.find({teams: {$in: array}})
  },

  displayCoachesTeams: function(req) {
    return Users.findOne({_id: req.session.username}).then(function(user){
      return Teams.find().then(function(allteams){
        var array = [];
        for(var i = 0; i < allteams.length; i++){
          if(user.username.toString() === allteams[i].coach.toString()){
            array.push(allteams[i].coach)}
          }
            user.teams = allteams;
            return user
          }).then(function(user){
            var array = [];
            for(var i = 0; i < user.teams.length; i++){
              array.push(user.teams[i]._id)
              }
              return Divisions.find({teams: {$in: array}}).then(function(divisions){
                user.divisions = divisions
                return user
              })
          })
  })
},

  findIndividualPlayer: function(req){
    return Players.findOne({_id: req.params.id})
  }
};
