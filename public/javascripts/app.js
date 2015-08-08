var login = document.getElementsByClassName("login")[0]
var display = document.getElementsByClassName("form-login")[0];
var container = document.getElementsByClassName("container");
var cancel = document.getElementsByClassName("cancel-login")[0];

login.addEventListener("click", function() {
  for(var i = 0; i < container.length; i++) {
    container[i].style.opacity = "0.3";
  }
  display.style.display = "block";
  container[2].style.opacity = "1";
})

cancel.addEventListener("click", function() {
  for(var i = 0; i < container.length; i++) {
    container[i].style.opacity = "1";
  }
  display.style.display = "none";
  container[2].style.opacity = "0";
})
