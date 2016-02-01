import MyClass from "./MyClass";

var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback);
};

domReady(function() {

var myClass = new MyClass(document.getElementById("audio"));
});


	