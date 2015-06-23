if (!$.JsonRpcClient) {
  throw new Error('JQuery.JsonRpcClient.js has to be instanciated first!');
}

var CarmenWebsocket = function(callback) {

  var _connection=null; //new $.JsonRpcClient({ ajaxUrl: "", socketUrl: host });
  //var _sources = [];
  
  var _queries = Object.create( null ) ;
  var _queryHandles =[];
  
  var _timer = {};
  
  
  var  _frequency = 100;
  
  var _delayedQueries = [];

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
	"useTopedSettings": false};
	
  var _ConnectionState = 0;
  var _webSocket=null;
  var _socketUrl=null;
  var _connetionStateCallback=callback;
  var _startTime = 0;
  
  var self = this;
  
  function _setConnectionState(state)
  {
	  if (state!=_ConnectionState)
	  {
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
			_setConnectionState(1);
			_initDelayedQueries();
			
			// Init Timer
			_timer = setInterval(_update, _frequency);

			_update();

//			if (typeof(callback) === "function") callback();
		}.bind(this);
		_webSocket.onclose = function(evt)
		{
			self.closeConnection();
		}.bind(this);	  
	}

    return _webSocket; 
  }
  
  this.createConnection = function(host) {
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
  }; 
  
  function _initDelayedQueries ()
  {
	_delayedQueries.forEach( function (q)
	{
		self.createQueryBySerializeString.apply(self,q);
	});
	
	_delayedQueries=[];
  }
  
  this.closeConnection = function()
  {
     // Clear Timer
    clearInterval(_timer);

	if (_webSocket!=undefined)
	{
		_webSocket.close();
	}
	
	if (_connection != undefined)
	{	
		delete _connection;
		_connection = null;
	}
	
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
	
	_queries = {};
	_queryHandles = [];
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
  
  this.createQueryBySerializeString = function(source, serializeString,callback, cbError)
  {
 	if (_connection === undefined)
	{
		throw new Error('No connection specified!');
	}
	
	if (_ConnectionState==0)
	{
		_delayedQueries.push(arguments);
		return;
	}
	
 	_connection.call(
	'createConnection', [source, [serializeString]],
	function(result){
	  if (result!==undefined && result.handle!=0)
	  {
		  var handle = result[0];
		  _connection.call('getElementInstanceSpecification',[serializeString],
		  function(specification)
		  {
			_connection.call('setInterpreterSettings',[handle, defaultInterpretationSettings ]);
			var query = new CarmenWebsocket.Query(handle);
			//query.handle = handle;
			query.serializeString = serializeString;
			query.specification = specification; 
			query.interpreterSettings = defaultInterpretationSettings;
			_queries[handle] = query;
			_queryHandles.push(handle);
			callback(query);
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
	cbError);	
  };
  
  this.releaseQuery = function(query)
  {
	_queries.delete(query.handle);
	if (_queryHandles.indexOf(query.handle)!=-1)
	{
		_queryHandles.splice(_queryHandles.indexOf(query.handle));
	}
	
   	if (_connection !== undefined && query.handle!==undefined)
	{
		_connection.call('releaseConnection',query.handle);
	}
  }
  
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
  
  this.setInterpreterSettins = function(query,settings)
  {
 	if (_connection === undefined)
	{
		throw new Error('No connection specified!');
	}

	if (query.handle===undefined)
	{
		throw new Error("Invalid query!");
	}	
	
	var s = defaultInterpretationSettings;
	// only transfer valid properties
	for ( var name in s )
	{
		if (settings[name]!==undefined && typeof(settings[name])== typeof(s[name]))
		{
			s = settings[name];
		}
	}
	
	_connection.call('setInterpreterSettings',[handle, s ]);
  }

  function _update()
  {
	var handles = _queryHandles;
	_connection.call(
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
	
	_connection.call('getMeasurementStartTime',[],function(result)
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
	});	
  } 
  
  return this;

}; /**  /websocket  **/

//CarmenWebsocket.prototype.constructor = CarmenWebsocket;


CarmenWebsocket.Query = function(handle)
{
	this.handle = handle;
	this.values = [];
	this.queueSize = 400;
}

CarmenWebsocket.Query.prototype.queueSize = 1;
CarmenWebsocket.Query.prototype.addValue = function(value)
{
	if (value!==undefined && (value.elements.length>0))
//	if (value!==undefined)
	{
		this.values.push({time: value.time, value: value.elements[0].value});
		if (this.values.length>this.queueSize)
		{
			this.values.shift();
		}
	}
}
