if (!Carmen) {
  throw new Error('Carmen.js has to be instanciated first!');
}

Carmen.Scope = function(host, callback) {

  if (arguments.length === 0)
    throw new Error('Provide Host String ("localhost:1234") for creating an instance of Scope');

   var  _name = 'Default Scope',
        _frequency = 1e3,
        _timer = {},
        _host = 'localhost:1234',
        _online = false,
        _cursors = [],
        _events = [],
        _colorscale = d3.scale.category10();

        _elements = [];

	var _webSocket = new CarmenWebsocket(callback);
	var _source = "{cb23844c-ccd1-426d-9828-ad17f1f67d78}";
	
    // Create some properties to give an extension to the object's namespace.
    // e.g. myscope.element.add() --> see below!
    // Note the lower case, this is not the original class reference!
    // Note that this variable is private.

    var element;

    // Todo:
    // Lag recognition and feedback
    // Online / Offline detection
    // Get current signal state.
    // Get min+max since last call
    // Get global (session-wise) min/max values and attach them to the elements
    // time window (global, hi-res, ...)
    // cleanup elements (clear old values, if necessary)
    // Refactor Connect/Disconnect to use promises instead of callbacks.
    // Built-In data sources (Square, Triangle, Sinus, Noise)
    // Global Online/Offline Status

 
	
  this.name = function(_) {
    if (!arguments.length) return _name;
    _name = _; return this;
  };

  this.frequency = function(_) {
    if (!arguments.length) return _frequency;
    _frequency = +_; return this;
  };

  this.host = function(_) {
    if (!arguments.length) return _host;
    _host = +_; return this;
  };

  this.online = function() {
    if (arguments.length) throw new Error('Property online is readonly. Use connect() instead.');
    return _online;
  };

  this.source = function() {
    if (arguments.length) throw new Error('Property source is readonly. Use connect() instead.');
    return _source;
  };
  
  

  this.colorscale = function(_) {
    return _colorscale(_);
  };

  var checkOnlineState = function() {
    _widgets.forEach(function(w) {
      w.online(_online);
    });
  };

  this.connect = function(callback) {
    console.log('Connecting...');
	_webSocket.createConnection(host);
    //console.log('Connected.');
   _online = _webSocket.isConnected();
 
   _elements.forEach(function(e) {
     e.init();
   });	
 // _online = true;
	
	
    // Init Timer
    _timer = setInterval(this.heartbeat, _frequency);
    // .. and fire directly.

 //   $('.cmd-connect').hide();
 //   $('.cmd-disconnect').show();

    this.heartbeat();

    if ((arguments.length) & (typeof(callback) === "function")) callback(this);
    return this;
  };

  this.disconnect = function(callback) {
    console.log('Disconnecting...');

    // Clear Timer
    clearInterval(_timer);
	
  _elements.forEach(function(e) {
     e.reset();
   });	
	
	if (_webSocket!==undefined)
	{
		_webSocket.closeConnection();
	}

 /*	_online = false;*/
	
 //   $('.cmd-connect').show();
 //   $('.cmd-disconnect').hide();

 //   console.log('Disconnected.');
    _online = false;
    checkOnlineState();
    $('.cmd-online').removeClass('active');
    if ((arguments.length) & (typeof(callback) === "function")) callback(this);
    return this;
  };

  this.webSocket = function()
  {
    if (arguments.length) throw new Error('Property online is readonly. Use connect() instead.');
    return _webSocket;
  }
  
  this.startTime = function() {
    if (arguments.length) throw new Error('Property startTime is readonly.');
    return _webSocket!=null?_webSocket.startTime():0;
  }; 
  
  this.heartbeat = function() {

    // console.log('Heartbeat!');

    // Todo: Check online status, poll new data, etc.

    checkOnlineState();

  /*  _elements.forEach(function(e) {

      //var value = Math.max(-10, Math.min(10, (e.current()!==undefined ? e.current().value : 0) + 0.8 * Math.random() - 0.4 + 0.2 * Math.cos(e.i += 0.2)));
      var value = e.generator(); // this.SignalGenerator((e.current()!==undefined ? e.current().value : 0), e.i);
      d = { time: new Date(), value: value };

      e.min = d.value < e.min ? d.value : e.min;
      e.max = d.value > e.max ? d.value : e.max;

      e.data.push(d);
      e.data.shift();
      // e.hash = Math.random();
    });*/

    _widgets.forEach(function(w) {
      // w.bind();
      w.refresh(w);
    });

  };

  /****************************** ELEMENTS ************************/
  // Element Helper Functions (add, remove, ...)

  this.element = function(_) {
    // var scope = this;
    if (!arguments.length) return this.element;

    // if element _ exists, return this element.
    if (arguments.length == 1) {
      if (_elements.indexOf(_) > -1) {
        return _;
      }
    }
    console.warn('Element cannot be created this way. Use element.add("reference") instead.');
    // otherwise return this function.
    return this.element;
  };
  this.element.scope = this;

  this.element.add = function(name, reference) {
    var e = new Carmen.Scope.Element(name, reference, this.scope);
    e.color(this.scope.colorscale(e.id));
    _elements.push(e);
	if (_webSocket.isConnected()) e.init();
    return e;
  };

  this.elements = function(_) {
    if (!arguments.length) return _elements;
    if (!(_ instanceof Carmen.Scope.Element)) throw new Error('Argument is not an instance of Carmen.Scope.Element!');
    // Create reference to self inside element.
    if (_elements.indexOf(_) == -1) {
      _.scope = this;
      _elements.push(_);
    } else {
      console.warn('Trying to add duplicate element to current scope (Action: skipped)!', _);
    }
    return this;
  };

  /****************************** WIDGETS ************************/

  var _widgets = [];
  var widget;

  this.widget = function(_) {
    var myscope = this;
    if (!arguments.length) return this.widget;
    // if widget _ exists, return this widget.
    if (arguments.length == 1) {
      if (_widgets.indexOf(_) > -1) {
        return _;
      }
    }
    console.warn('Widgets cannot be created this way. Use widget.add(...) instead.');
    // otherwise return this function.
    return this.widget;
  };
  this.widget.scope = this;

  this.widget.add = function (Class, container) {
    var w = new Class(this.scope, container);
    _widgets.push(w);
    return w;
  };

  /****************************** CONTAINERS ************************/

  var _containers = [];
  var _container = null;

  var container;
  this.container = function(_) {
    if (!arguments.length) return this.container;
    // if widget _ exists, return this widget.
    if (arguments.length == 1) {
      _container = Carmen.Container(_);
    }
    return _container;
  };
  this.container.scope = this;
  this.container.add = function(widths) {
    if (_container === null) { console.warn('Container is null. Adding Container to <body>.'); }
    else {
      return _container.add(widths);
    }
  };


  return this;

}; /**  /scope  **/

Carmen.Scope.prototype.constructor = Carmen.Scope;
