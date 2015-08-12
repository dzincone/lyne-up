var login = document.getElementsByClassName("login")[0]
var display = document.getElementsByClassName("form-login")[0];
var container = document.getElementsByClassName("container");
var cancel = document.getElementsByClassName("cancel-login")[0];
var addPlayer = document.getElementsByClassName("add-player")[0];

if(login){
login.addEventListener("click", function() {
  for(var i = 0; i < container.length; i++) {
    container[i].style.opacity = "0.3";
  }
  display.style.display = "block";
  container[2].style.opacity = "1";
})
}

if(cancel){
cancel.addEventListener("click", function() {
  for(var i = 0; i < container.length; i++) {
    container[i].style.opacity = "1";
  }
  display.style.display = "none";
  container[2].style.opacity = "0";
})
}

if(addPlayer){
  var count = 1;
addPlayer.addEventListener("click", function() {
  count++
  var submit = document.getElementById("submit-team");
  submit.parentElement.removeChild(submit)
  if(document.getElementById('count')){
    var currentcount = document.getElementById('count');
    currentcount.parentElement.removeChild(currentcount);
  }
  var row = document.createElement("div");
  var labeldiv = document.createElement("div");
  var inputdiv = document.createElement('div');
  var label = document.createElement("label");
  var input = document.createElement("input");
  var title = document.createElement("h3");
  row.appendChild(title);
  title.innerHTML = "Player " + count + " Information";
  label.innerHTML = "First Name";
  label.htmlFor = "player" + count + "_first_name"
  labeldiv.appendChild(label);
  input.name = "player" + count + "_first_name";
  input.id = "player" + count + "_first_name";
  input.type = "text";
  inputdiv.appendChild(input);
  inputdiv.className = "input";
  labeldiv.className = "label";
  row.appendChild(labeldiv);
  row.appendChild(inputdiv);
  row.className = "row";
  addPlayer.parentElement.parentElement.parentElement.appendChild(row);
  var row = document.createElement("div");
  var labeldiv = document.createElement("div");
  var inputdiv = document.createElement('div');
  var label = document.createElement("label");
  var input = document.createElement("input");
  label.innerHTML = "Last Name";
  label.htmlFor = "player" + count + "_last_name"
  labeldiv.appendChild(label);
  input.name = "player" + count + "_last_name";
  input.id = "player" + count + "_last_name";
  input.type = "text";
  inputdiv.appendChild(input);
  inputdiv.className = "input";
  labeldiv.className = "label";
  row.appendChild(labeldiv);
  row.appendChild(inputdiv);
  row.className = "row";
  addPlayer.parentElement.parentElement.parentElement.appendChild(row);
  var row = document.createElement("div");
  var labeldiv = document.createElement("div");
  var inputdiv = document.createElement('div');
  var label = document.createElement("label");
  var input = document.createElement("input");
  label.innerHTML = "Jersey Number";
  label.htmlFor = "player" + count + "_number"
  labeldiv.appendChild(label);
  input.name = "player" + count + "_number";
  input.id = "player" + count + "_number";
  input.type = "text";
  inputdiv.appendChild(input);
  inputdiv.className = "input";
  labeldiv.className = "label";
  row.appendChild(labeldiv);
  row.appendChild(inputdiv);
  row.className = "row";
  addPlayer.parentElement.parentElement.parentElement.appendChild(row);
  var row = document.createElement("div");
  row.className = "row";
  var input = document.createElement("input");
  input.name = "count";
  input.value = count;
  input.type = "hidden";
  input.id = "count";
  row.appendChild(input);
  addPlayer.parentElement.parentElement.parentElement.appendChild(row);
  var row = document.createElement("div");
  row.className = "row";
  var inputdiv = document.createElement('div');
  inputdiv.className = "input";
  var submit = document.createElement("input");
  submit.type = "submit";
  submit.value = "Submit Team";
  submit.id = "submit-team";
  inputdiv.appendChild(submit);
  row.appendChild(inputdiv);
  addPlayer.parentElement.parentElement.parentElement.appendChild(row);

})
}
