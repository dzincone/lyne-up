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

var users =  mongoose.model("users", userSchema);
var leagues =  mongoose.model("leagues", leaguesSchema);
var divisions = mongoose.model("divisions", divisionSchema)

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

  checkRole: function(req, res) {
    return users.findOne({username: req.session.username}).then( function(user){
      if(user.role === "leagueowner"){
        return leagues.find({league_owner: user.username}).then(function(leagues){
          if(leagues.length != 0){
            var array = [];
            return divisions.find().then(function(data){

              if(data.length != 0){

              for(var i = 0; i < leagues.length; i++){

                for(var j = 0; j < leagues[i].divisions.length; j++){

                  for(var k = 0; k < data.length; k++){
                    if(leagues[i].divisions[j].toString() === data[k]._id.toString()){
                      array.push(data[k]._id)
                    }
                  }
                }return divisions.find({_id: {$in: array}}).then(function(divisions){

                  res.render("lyneup/league-owner/index", {user: req.session.username, name: req.session.name, leagues: leagues, divisions: divisions})
                })
              }

            } else{
                res.render("lyneup/league-owner/index", {user: req.session.username, name: req.session.name, leagues: leagues})
            }
            })
          } else {
              res.render("lyneup/league-owner/index", {user: req.session.username, name: req.session.name})
          }
        })
      } else if(user.role === "coach"){
        res.render("lyneup/coach/index", {user: req.session.username, name: req.session.name})
      } else if(user.role === "regular"){
        res.render("lyneup/regular/index", {user: req.session.username, name: req.session.name})
      }
    })
  },

  insertLeague: function(req) {
    return leagues.findOneAndUpdate({league_name: req.body.name},
                            {league_owner: req.session.username,
                            league_name: req.body.name,
                            address: {street: req.body.street,
                                      city: req.body.city,
                                      state: req.body.state,
                                      zip: req.body.zip

                            },
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
                          {$set:
                            {league_name: req.body.name,
                            address: {street: req.body.street,
                                      city: req.body.city,
                                      state: req.body.state,
                                      zip: req.body.zip

                            },
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
                              {$addToSet: {divisions: division._id}
                              })
                            })
  },

  removeDivision: function(req){
    return leagues.findOneAndUpdate({_id: req.params.id},
                                    {$pop: {divisions:req.params.divisionid}
  })

  },

  findDivisionToUpdate: function(req){
    return divisions.findOne({_id: req.params.divisionid})
  }
};
