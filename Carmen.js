var iid = 0;

var Carmen = (function() {

  // Notiz: console.log / console.dir / console.time / console.table

  // Todo
  // Serialisation / Deserialisation
  // Position, Reordering of widgets

  $('.cmd-connect').show();
  $('.cmd-disconnect').hide();

  var _widgets = [];
  var _scopes = [];
  var _temp = 0;

  this.widgets = function(_) {
    if (!arguments.length) return _widgets;
    if (!(_ instanceof Carmen.Widget)) throw new Error('Argument is not an instance of Carmen.Widget.');
    _widgets.push(_);
    return this;
  };

  this.scopes = function(_) {
    if (!arguments.length) return _scopes;
    if (!(_ instanceof Carmen.Scope)) throw new Error('Argument is not an instance of Carmen.Scope.');
    _scopes.push(_);
    return this;
  };

  this.version = '3.1.0';

  this.toString = function() {
    return "Carmen Widget Engine (Version " + this.version + ")";
  };


  // The following code includes static HTML fragments one time.

  $(function(){
        $("body").append($('<div id="ExtWidget"></div>'));
        $("#ExtWidget").load("html/Widget.html");
      });


  return this;
})();
