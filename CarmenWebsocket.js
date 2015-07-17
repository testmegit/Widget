/*if (!$.JsonRpcClient) {
  throw new Error('JQuery.JsonRpcClient.js has to be instanciated first!');
}*/

/**
* @fn CarmenWebsocket
* Constructor of websocket wrapper
*
* @param callback     function is called when state of connection changes with new state as parameter (see _ConnectionState)
*/ 
var CarmenWebsocket = function(callback) {

//  var _connection=null; 
  
  //var _queries = Object.create( null ) ;
  //var _queryHandles =[];
  var _listeners = Object.create( null ) ;
  var _runningStateListener = null;
  
  var _timer = null;
  var  _frequency = 66;
  
  // store requests for elements here until connection to server is available
  var _delayedQueries = [];

  // default interpreter settings
  var defaultInterpretationSettings = {
	"language": "de",
	"showContainer": false,
	"showElementType": false,
	"showFrame": false,
	"showInterpretedSignalValue": true,
	"showRawSignalValue": false,
	"showSignals": true,
	"showUnit": false,
	"useAbsoluteTime": false,
	"useShortNames": true,
	"useTopedSettings": false,
	"policy": "currentChanged"};
	
	// current connection state (0: not connected, 1: connected, 2: measurement is running)
	var _ConnectionState = 0;
	
	// websocket object
	var _webSocket=null;
	
	// address of web socket server
	var _socketUrl=null;
	
	// callback for change of connection state
	var _connetionStateCallback=callback;
	
	// UTC starttime of measurement in sec
	var _startTime = 0;

	// id counter for webSocket requests
	var _current_id =0;
	
	// callback handlers for answers of webSocket requests
	var _ws_callbacks = {};

	// easy access to this in functions
	var self = this;
  
    /**
	* @fn createConnection
	* Create connection to server
	*
	* @param host     address of server
	*/ 
	this.createConnection = function(host) {
	if (!arguments.length) return _webSocket;

	if (!_webSocket || host!==_socketUrl)
	{
	/*	if (_webSocket)
		{
			self.closeConnection();
			delete _webSocket;
			_webSocket = null;
		}	
		_connetionStateCallback = callback;*/
		_socketUrl = host;
		
		// create instance
		var socket = _getSocket(_wsOnMessage);
		
		if (socket.readyState===1)
		{
			//_setConnectionState(1);		
			_startupConnection();
		}
		
	}
	return this;
	}; 

	/**
	* @fn closeConnection
	*
	* Closes connection to server no params
	*/ 
	this.closeConnection = function()
	{
		// Clear Timer
		//clearInterval(_timer);

		if (_webSocket!=undefined)
		{
			_webSocket.close();
			_webSocket=null;
		}

		/*	if (_connection != undefined)
		{	
			delete _connection;
			_connection = null;
		}*/

		_setConnectionState(0);

		/*	
		foreach(query in _queries)
		{
			query.values.clear();
			query.handle=0;
		}	
		*/
		/*	for(var query in _queries)
		{
			delete _queries.query;
		}*/

		_listeners = {};
		_runningStateListener = null;
//		_queries = {};
//		_queryHandles = [];
		_delayedQueries = [];
	};
  
 	this.startMeasurement = function() {
		if (arguments.length) throw new Error('Property startMeasurement is readonly.');
		if (_ConnectionState>1) return;
	
		_notify('startMeasurement',[]);
		return this;
	};  
  
	this.stopMeasurement = function() {
		if (arguments.length) throw new Error('Property stopMeasurement is readonly.');
		if (_ConnectionState<2) return;
	
		_notify('stopMeasurement',[]);
		return this;
	};    
  
	this.isRunning = function() {
		if (arguments.length) throw new Error('Property isRunning is readonly.');
		return _ConnectionState>1;
	};
  
	this.isConnected = function() {
		if (arguments.length) throw new Error('Property isConnected is readonly.');
		return _ConnectionState>0;
	};
  
	this.startTime = function() {
		if (arguments.length) throw new Error('Property startTime is readonly.');
		return _startTime;
	}; 
  
 
   /**
   * @fn getOnlineSources
   * Get all available online sources. Result is returned via callback
   *
   * @param callback    function is called if query was successful with an array of of objects each describing one online source
   * @param cbError		callback if there was an error
   */   
	this.getOnlineSources = function(callback, cbError)
	{
		if (_connection === undefined)
		{
			throw new Error('No connection specified!');
		}
		_connection.call(
		'getOnlineSources', [],
		callback,
		cbError);
	};
  
	/**
	* @fn createQueryBySerializeString
	* Create a data sink for a particular element specified by its serializeString
	*
	* @param source    			uuid of source (can be fetched by a call of getOnlineSources)
	* @param serializeString	serializeString specifying the element to be watched
	* @param callback    		function is called if creation was successful with an object wrapping the data sink of the element as parameter
	* @param cbError			callback if there was an error
	*/  
	this.createQueryBySerializeString = function(source, serializeString, callback, cbError)
	{
		if (_ConnectionState==0)
		{
			console.log("createQueryBySerializeString -> (delayed)");
			_delayedQueries.push(arguments);
			return;
		}

		console.log("createQueryBySerializeString -> (normal)");

		// 	_connection.call(
		_request(
//		'createListener', [source, [serializeString],{type: "interpreted"}],
		'createListener', [source, [serializeString], "interpreted"],
		function(result)
		{
		  if (result!==undefined && result.handle!=0)
		  {
			  var handle = result[0];
			  /*_connection.call*/_request('getElementInstanceSpecification',[serializeString],
			  function(specification)
			  {		
				_request('setInterpreterSettings',[handle, defaultInterpretationSettings ],	function(result)
				{
					query.interpreterSettings = result;
				});
				var query = new CarmenWebsocket.Query(handle, self);
				query.serializeString = serializeString;
				query.specification = specification; 
				query.interpreterSettings = defaultInterpretationSettings;
				_listeners[handle] = query;
				callback(query);
				//_queries[handle] = query;
				//_queryHandles.push(handle);
/*				_request('addListenerForInterpretedMessages',[handle,1],
				function(listener)
				{
					if (listener!=0)
					{
						query.listener = listener;
						_listeners[listener] = query;
						callback(query);
					}
				},
				function(error)
				{
				
				});*/
			  }, 
			  function(error)
			  {
				cbError(error);
			  });
		  }
		  else
		  {
			if (result[1] === defined)
			{
			  cbError( result[1]);
			}
			else
			{
			  cbError("creating query failed");
			}
		  }
		},
		function(error) {
			console.log("createConnection error:" + error);
			cbError(error);

		});	
	};
 
	/**
	* @fn releaseQuery
	* releases element so no more data are received for this element
	*
	* @param query    			element to be removed
	*/  
	this.releaseQuery = function(query)
	{
		_queries.delete(query.handle);
		if (_queryHandles.indexOf(query.handle)!=-1)
		{
			_queryHandles.splice(_queryHandles.indexOf(query.handle));
		}

		/*  	if (_connection !== undefined && query.handle!==undefined)
		{
			_connection.call('releaseConnection',query.handle);
		}*/

		if (query.handle!==undefined)
		{
			_notify('releaseConnection',query.handle);
		}
	}
  
	/**
	* @fn findQuery
	* returns data sink wrapper object for a particular handle
	*
	* @param query    			element to be removed
	*/ 
	this.findQuery = function(handle)
	{
		return _queries[handle];
	}   
  
/*  this.getCurrentValue(query,callback, cbError)
  {
  	if (_connection === undefined)
	{
		throw new Error('No connection specified!');
	} 
	
	if (query.handle!==undefined)
	{
		_connection.call(
		'getCurrentInterpretedMessage', [query.handle], callback,	cbError);
	}
	else
	{
		cbError("invalid query");
	}
  }*/
  
	/**
	* @fn setInterpreterSettings
	* configure the content of the interpreted data of a particular element
	* each query object provides the current settings via "interpreterSettings"
	*
	* @param query    		element to be configured
	* @param settings		object containing all values to be changed
	*/ 	
	this.setInterpreterSettings = function(query,settings)
	{
		if (query.handle===undefined)
		{
			throw new Error("Invalid query!");
		}	

		var s = Object.create( null );
		var len = 0;
		// only transfer valid properties
		for ( var name in defaultInterpretationSettings )
		{
			if (settings[name]!==undefined && typeof(settings[name])== typeof(defaultInterpretationSettings[name]))
			{
				// only settings which are changing
				if (query.interpreterSettings[name]==undefined || query.interpreterSettings[name]!== settings[name])
				{
					s[name] = settings[name];
					len++;
				}
			}
		}

		if (len)
		{
			_request('setInterpreterSettings',[query.handle, s ],
			function(result)
			{
				query.interpreterSettings = result;
			});
		}
	} 
  
  
	function _setConnectionState(state)
	{
		if (state!=_ConnectionState)
		{
			if (state==2)
			{
				// we are (re)starting, clear old data first
				/*for (var query in  _queries)
				{
					_queries[query].reset();
				};	*/	
				for (var listener in  _listeners)
				{
					_listeners[listener].reset();
				};	

				// Init Timer
				//_timer = setInterval(_update, _frequency);			
			}
			else
			{
				// Clear Timer
				if (_timer!=null) 
				{
					clearInterval(_timer);
				}
			}
			_ConnectionState = state;
			if (typeof(_connetionStateCallback) === "function" ) _connetionStateCallback(_ConnectionState);
		}
	}
  
	function _getSocket(onmessage_cb)
	{
		 // If there is no ws url set, we don't have a socket.
		// Likewise, if there is no window.WebSocket.
		if (_socketUrl === null ) return null;

		if (_webSocket === null || _webSocket.readyState > 1) {
		  // No socket, or dying socket, let's get a new one.
		  _webSocket = new WebSocket(_socketUrl);

		  // Set up onmessage handler.
		  _webSocket.onmessage = onmessage_cb;

			_webSocket.onopen = function(evt)
			{
				//_setConnectionState(1);
				console.log('_startupConnection');
				_startupConnection();
				console.log('_initDelayedQueries' + _delayedQueries);
				_initDelayedQueries();
				
				// Init Timer
		//			_timer = setInterval(_update, _frequency);

		//			_update();

		//			if (typeof(callback) === "function") callback();
			};
			_webSocket.onclose = function(evt)
			{
				self.closeConnection();
			};	  
		}

		return _webSocket; 
	}
  
	function _startupConnection()
	{
		_setConnectionState(1);
		_request('activateListener',["runningstate", true ],
			function( result)
			{
				if (result!=undefined && result[0]===true)
				{
					_runningStateListener = new CarmenWebsocket.Query(0);
					_runningStateListener.addValue = function(result)
					{
						try
						{
							if (result == undefined)
							{
								_setConnectionState(min(1,_ConnectionState));
							}	
							else							
							{
								var newState = result.state?2:1;
								if (newState==2) _startTime = result.starttime;
								_setConnectionState(newState);
							}
							
						}							
						catch(err)
						{
							console.log(err);
						}
					};
				}
				else
				{
					 console.log('installing startup listener failed: '+result[1]);
					 self.closeConnection();
				}
			},
			function(error)
			{
				console.log('startup connection error:' + error);
				self.closeConnection();
			});	
	}
  
/*  this.createConnection = function(host) {
    if (!arguments.length) return _connection;
	
	if (!_connection || host!==_socketUrl)
	{
		if (_connection) self.closeConnection();
		if (_webSocket)
		{
			delete _webSocket;
			_webSocket = null;
		}	
		_socketUrl = host;
		_connetionStateCallback = callback;
		_connection = new $.JsonRpcClient({ ajaxUrl: "", socketUrl: host, getSocket : _getSocket}); 
		
		// create instance
		var socket = _connection.options.getSocket(_connection.wsOnMessage);
		
		if (socket.readyState===1)
		{
			_setConnectionState(1);		
		}
		
	}
	return this;
  }; */
  
  
	function _initDelayedQueries ()
	{
		//	console.log("DelayedQueries begin...");
		_delayedQueries.forEach( function (q)
		{
			self.createQueryBySerializeString.apply(self,q);
		});

		_delayedQueries=[];
		//  	console.log("DelayedQueries end...");
	}
  
  
	function _request(method, params, success_cb, error_cb) {
	// Construct the JSON-RPC 2.0 request.
		var rpc = {
		  jsonrpc : '2.0',
		  method  : method,
		  params  : params,
		  id      : _current_id++  // Increase the id counter to match request/response
		};

		// Try making a WebSocket call.
		_wsCall(rpc, success_cb, error_cb);
	};
  
	function _notify (method, params) {
		// Construct the JSON-RPC 2.0 notification.
		var rpc = {
		  jsonrpc: '2.0',
		  method:  method,
		  params:  params
		};

		// Try making a WebSocket call.
		_wsCall(rpc);
	}
  
	// send call to server
	function _wsCall(request, success_cb, error_cb) {
		if (_webSocket==null)
		{	
			console.log("_webSocket==null");
			return;
		}

		var request_json = JSON.stringify(request);

		if (_webSocket.readyState < 1) {
			console.log("readyState < 1");

		  // Set up sending of message for when the socket is open.
		  _webSocket.onopen = function() {
			// Send the request.
			_webSocket.send(request_json);
		  };
		}
		else {
		  // We have a socket and it should be ready to send on.
		 _webSocket.send(request_json);
		}

		// Setup callbacks.  If there is an id, this is a call and not a /*.
		if ('id' in request && typeof success_cb !== 'undefined') {
		  _ws_callbacks[request.id] = { success_cb: success_cb, error_cb: error_cb };
		}
	}; 
  
  // callback for received data from server
	function _wsOnMessage (event) {
		// Check if this could be a JSON RPC message.
		try {
		  var response = JSON.parse(event.data);

		  /// @todo Make using the jsonrcp 2.0 check optional, to use this on JSON-RPC 1 backends.

		  if (typeof response === 'object'
			  && 'jsonrpc' in response
			  && response.jsonrpc === '2.0') {

			/// @todo Handle bad response (without id).

			// If this is an object with result, it is a response.
			if ('result' in response && _ws_callbacks[response.id]) {
			  // Get the success callback.
			  var success_cb = _ws_callbacks[response.id].success_cb;

			  // Delete the callback from the storage.
			  delete _ws_callbacks[response.id];

			  // Run callback with result as parameter.
			  success_cb(response.result);
			  return;
			}
			// notification from server
			else if ('method' in response)
			{
				if (response.method==='interpreted')
				{				
					response.params.forEach(function(result){
					
						var handle = result.listener;
						if (handle in _listeners)
						{
							_listeners[handle].addValues(result.data);
						}
					});
				}
				else if (response.method==='runningstate')
				{
					if (_runningStateListener!=null) 
					{
						_runningStateListener.addValue(response.params);
					}
				}
				return;
			}
			// If this is an object with error, it is an error response.
			else if ('error' in response && _ws_callbacks[response.id]) {
			  // Get the error callback.
			  var error_cb = _ws_callbacks[response.id].error_cb;

			  // Delete the callback from the storage.
			  delete _ws_callbacks[response.id];

			  // Run callback with the error object as parameter.
			  error_cb(response.error);
			  return;
			}
		  }
		}
		catch (err) {
		  // Probably an error while parsing a non json-string as json.  All real JSON-RPC cases are
		  // handled above, and the fallback method is called below.
		}
	}; 
  
	function _update()
	{
		var currentTime = (new Date().getTime()-_startTime*1000)*1000000;
		for (var listener in  _listeners)
		{
			_listeners[listener].updateTime(currentTime);
		}
		/*var handles = _queryHandles;
		//	_connection.call(
		_request(
		'getCurrentInterpretedMessages', [handles], function(resultList)
		{
		//		var map = {};
		//		var handles = Object.keys(_queries);
			if (resultList!==undefined && handles.length== resultList.length)
			{
				resultList.forEach(function(result,i)
				{
					if (_queries[handles[i]]!==undefined )
					{
						_queries[handles[i]].addValue( result);
					}
				});
			}
			
			//callback(map);

		}, function(error)
		{
			console.log('update error:' + error);
		});

		_connection.call*+/_request('getMeasurementStartTime',[],function(result)
		{
			if (result !== "undefined")
			{
				var newState = result>0?2:1;
				if (newState==2) _startTime = result;
				_setConnectionState(newState);
			}
			else
			{
				_setConnectionState(min(1,_ConnectionState));
			}
				
		},
		function (error){
			console.log('update error:' + error);
		});	*/
	} 
  
  return this;

}; /**  /websocket  **/

//CarmenWebsocket.prototype.constructor = CarmenWebsocket;


CarmenWebsocket.Query = function(handle, webSocket, timeSpan_ms)
{
	this.handle = handle;
	this.webSocket = webSocket;
	this.currentValue = null;
	if(timeSpan_ms==undefined || timeSpan_ms<=0)
	{
		this.values = null;
		this.timeSpan = 0;
	}
	else
	{
		this.values = [];
		this.timeSpan = timeSpan_ms*1000000; // ms -> ns
	}
}

CarmenWebsocket.Query.prototype.timeSpan = 0;
CarmenWebsocket.Query.prototype.minArraySize = 128;
CarmenWebsocket.Query.prototype.addValue = function(value)
{
	if (value!=undefined && (value.elements.length>0))
//	if (value!==undefined)
	{
		this.currentValue = {time: value.time, value: value.elements[0].value};
		if (this.values!=null && this.timeSpan!==0)
		{
			this.values.push(this.currentValue);
			
			if (this.values.length>this.minArraySize && (value.time-this.values[0].time)>this.timeSpan*1.5)
			{
				this.values.shift();
			}
			
		}
/*		//if (this.values.length>this.queueSize)
		if (this.values.length>1 && (value.time-this.values[0].time)>this.timeSpan)
		{
			this.values.shift();
		}*/
	}
}

CarmenWebsocket.Query.prototype.addValues = function(values)
{
	if (values!=undefined && values.length>0)
	{
		if (this.values==null)
		{
			this.addValue(values[values.length-1]).bind(this);
		}
		else 
		{
			values.forEach(this.addValue.bind(this));
		}
	}
}

CarmenWebsocket.Query.prototype.reset = function()
{
	if (this.values!=null) this.values.length=0;
	this.currentValue = null;
}

/*CarmenWebsocket.Query.prototype.updateTime = function(time)
{
	if (this.values!=null&& this.timeSpan!==0 )
	{
		var i=0;
		var refTime = this.timeSpan*1.5;
		while (i<this.values.length && (time-this.values[i].time>refTime))
		{
			i++;
		}
		
		if (i>0 && this.values.length-i>this.minArraySize)
		{
			this.values.splice(0,i);
		}
	}
}*/

CarmenWebsocket.Query.prototype.setContinous = function (timespan_ms)
{
	if (this.interpreterSettings["policy"]!=="recent")
	{
		this.webSocket.setInterpreterSettings(this, {"policy": "recent"});
	}
	
	var timespan = (timespan_ms!==undefined && timespan_ms>0)?timespan_ms*1000000:60000000000; // ms -> ns
	if (this.values==null) this.values = [];
	if (this.timeSpan<timespan)
	{
		this.timeSpan = timespan;
	}	
/*	if (timespan_ms>0)
	{
		if (this.values==null) this.values = [];
		var timespan = timespan_ms*1000000; // ms -> ns
		if (this.timeSpan<timespan)
		{
			this.timeSpan = timespan;
		}
	}*/
}
