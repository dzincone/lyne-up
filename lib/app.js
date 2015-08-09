module.exports = {

checkErrors: function(req, res){
      var errors = [];
      console.log(req.body)
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
      if(req.body.first === ""){
        errors.push("You must have a first name")
      }
      if(req.body.last === ""){
        errors.push("You must have a last name")
      }
      if(req.body.street === ""){
        errors.push("You cannot leave your street address blank")
      }
      if(req.body.city === ""){
        errors.push("You must enter a city to match your state")
      }
      if(req.body.zip === ""){
        errors.push("Please enter your Zip Code")
      }
      if(errors.length != 0){
        res.render('lyneup/create-account', {errors: errors});
      }
  }
}
