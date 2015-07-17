Carmen.Scope.Element = function(name,serializeString, scope) {

  // Todo
  // [ ] Element "Window", slicing the data
  // [ ]
  // [ ]
  // [ ]


  if (scope === undefined) console.warn('Elements should not be instanciated outside a scope. Use myscope.element.add("reference") instead.');

  var _color = "#FF0000";
  var _timeSpan_ms = null;
  
  var _webSocketQuery=null;
  function _createWebSocketQuery(element)
  {
	scope.webSocket().createQueryBySerializeString(this.scope.source(),element.serializeString,
	function(query)
	{
		_webSocketQuery = query;
		if (query.specification!==undefined)
		{
			element.definition.min = ("min" in query.specification)?query.specification.min:-Infinity;
			element.definition.max = ("max" in query.specification)?query.specification.max:Infinity;
			element.unit = ("unit" in query.specification)?query.specification.unit:"";
			element.definition.elementName = ("name" in query.specification)?query.specification.name:"";
			element.definition.elementShortName = ("shortname" in query.specification)?query.specification.shortname:"";
			element.name = element.definition.elementName.length?element.definition.elementName:element.definition.elementShortName;
			if ("enums" in query.specification)
			{
				element.definition.datatype = Carmen.ElementDataType.Digital;
				element.definition.enums = query.specification.enums;
			}
			else
			{
				element.definition.datatype = Carmen.ElementDataType.Analog;
			}
			
			if (_timeSpan_ms!==null)
			{
				_webSocketQuery.setContinous(_timeSpan_ms);
			}
			
		}
		//_webSocketQuery.values = element.data ;
		
		var widgets = element.widgets();
		widgets.forEach(function(w)
		{
			var widgetElements = w.elements();
			var test = true;
			widgetElements.forEach(function(we)
			{
				if (!we.isInitialized())
				{
					test = false;
				}
			});
			if (test) w.bind(w);
		});
	},
	function error(error)
	{
  
	});
  };

  this.id = (++iid);
  this.key = "element_" + this.id;
  this.name = name||'MyElementName';
  this.active = true;
  this.scope = scope;
  this.hash = null;
  this.unit = "";
  this.i = 0;
  this.serializeString = serializeString;



  this.definition = {};
  this.definition.datatype = Carmen.ElementDataType.Analog;
  this.definition.min = 0;
  this.definition.max = 10;

  // this.rule = {};

  // will be set to actual min/max range
  this.min = 0; // Infinity;
  this.max = 0; // -Infinity;

  
  this.init = function()
  {
	if (_webSocketQuery==undefined) 
	{
		console.log("Element.init ok");
		_createWebSocketQuery(this);
	}
	else
	{
		console.log("Element.init fail");
	}
  }
  this.isInitialized = function()
  {
	return _webSocketQuery!=null;
  }

  this.reset = function()
  {
    //this.data.clear;
	delete _webSocketQuery;
	_webSocketQuery=null;
  }
  
  this.color = function(_) {
    if (!arguments.length) return _color;
    _color = _; return this;
  };


  // this.current will always be the latest value.
  this.current = function(){ 
    //return this.data.length?this.data[this.data.length-1]:null; 
	return _webSocketQuery!=null? _webSocketQuery.currentValue:null;
  };
  this.currentValue = function(){
	var val = this.current();
	return val==null?0:val.value;	
  }
  
  this.data = function(){ 
    return _webSocketQuery!=null? _webSocketQuery.values:null; 
  };
  
	this.setContinous = function(timespan_ms)
	{
		if (!arguments.length) return _timeSpan_ms;
		_timeSpan_ms = timespan_ms; 
		if (_webSocketQuery!=null)
		{
			_webSocketQuery.setContinous(_timeSpan_ms);
		}
	}

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

 /*   for (i=0; i < seconds; i += (step_ms/1000)) {

      var t = new Date().setTime(now.getTime() - (seconds*1000) + (i*1000));
      var d = {
                time: t,
                value: this.generator()
                };
          this.data.push(d);
    }*/
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
