

// This works, but should not be used.
var elem = new Carmen.Scope.Element("myelem");
myscope.elements(elem);

// Use this instead
var elem = myscope.element.add("myelem");


// Connect Scope with feedback using a callback function
myscope.connect(function(s) { console.log(s.online()); });
