(function () {
  var link = document.getElementById("app-css-preload");
  if (!link) return;
  link.addEventListener("load", function () {
    this.rel = "stylesheet";
  }); 
})();
