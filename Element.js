Carmen.Scope.Element = function(name, scope) {

  // Todo
  // [ ] Element "Window", slicing the data
  // [ ]
  // [ ]
  // [ ]


  if (scope === undefined) console.warn('Elements should not be instanciated outside a scope. Use myscope.element.add("reference") instead.');

  var _color = "#FF0000";

  this.id = (++iid);
  this.key = "element_" + this.id;
  this.name = name || 'MyElementName';
  this.active = true;
  this.scope = scope;
  this.hash = null;
  this.unit = "km/h";
  this.i = 0;

  this.definition = {};
  this.definition.datatype = Carmen.ElementDataType.Analog;
  this.definition.min = -10;
  this.definition.max = 10;

  // this.rule = {};

  // will be set to actual min/max range
  this.min = 0; // Infinity;
  this.max = 0; // -Infinity;

  this.color = function(_) {
    if (!arguments.length) return _color;
    _color = _; return this;
  };


  // this.current will always be the latest value.
  this.current = function() { return this.data[this.data.length-1]; };
  this.data = [];

  var _widgets = [];
  this.widgets = function(_) {
    if (!arguments.length) return _widgets;
    if (!(_ instanceof Carmen.Widget)) throw new Error('Argument is not an instance of Carmen.Scope.Widget!');
    // Create reference to self inside element.
    if (_widgets.indexOf(_) == -1) {
      // _.scope = this;
      _widgets.push(_);
    } else {
      console.warn('Trying to add duplicate widget to current element (Action: skipped)!', _);
    }
    return this;
  };

  this.widget = function(_) {
    if (!arguments.length) return this.widget;

    // if element _ exists, return this element.
    if (arguments.length == 1) {
      if (_widgets.indexOf(_) > -1) {
        return _;
      }
    }
    console.warn('Element cannot be created this way. Use element.add("reference") instead.');
    // otherwise return this function.
    return this.widget;
  };
  this.widget.element = this;


  this.widget.remove = function(widget) {
    if (_widgets.indexOf(widget) != -1) {
      _widgets.splice(_widgets.indexOf(widget),1);
      // widget.element.remove(this.element);
    }
  };

  this.ping = function() {
    console.log("Ping of element " + name);
  };

  this.generator = function() {
    var value = this.current()!==undefined ? this.current().value : 0;
    return Math.max(-10, Math.min(10, (value) + 0.8 * Math.random() - 0.4 + 0.2 * Math.cos(this.i += 0.2)));
  };

  this.generator_load = function(seconds, step_ms) {

    var now = new Date();

    for (i=0; i < seconds; i += (step_ms/1000)) {

      var t = new Date().setTime(now.getTime() - (seconds*1000) + (i*1000));
      var d = {
                time: t,
                value: this.generator()
                };
          this.data.push(d);
    }
  };

  return this;

};

Carmen.Scope.prototype.SignalGenerator = function (value, i) {
};

Carmen.ElementDataType = {
    Undefined: 'Undefined',
    Analog: 'Analog',
    Digital: 'Digital',
    StringUTF8: 'String UTF-8',
    Complex: 'Complex'
};
