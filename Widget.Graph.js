// var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
// var parseDate = d3.time.format(".%S").parse;

Carmen.Graph = function(scope, container) {

	// Todo
	// [ ] Enhancement: Canvas statt SVG // Smooth scrolling ohne Neuzeichnen (CPU Load)
	// [ ] Bug: Update() fügt Duplicates ein
	// [ ] Axes
	// [ ] Mouse over
	// [ ]
	// [ ]
	// [ ]

	var _realtime = true;
	var _refreshTimer = {};
	var _autoscale = false;
	var _resolution = 1000;
	var _hAxis = 20;

	that = Carmen.Widget.call(this, scope, container);
  this.version = '0.0.1';
  this.description = 'Simple Graph display, showing the history of a value.';
  this.g = {};
	this.autoscale = false;


  var w = this.g.w = 800,
      h = this.g.h = 100;

	var x = this.g.x = d3.time.scale().range([0, w]);

	var xAxis = this.g.xAxis = d3.svg.axis().scale(x)
		.ticks(9)
		.tickSize(-h)
		.tickFormat(d3.time.format("%H:%M:%S"))
		.orient("bottom");

	/*
	var svg = this.g.svg = d3.select(this.content[0]).append("svg")
		.attr("width", w)
    .attr("height", h)
    .attr("class", "graphchart")
    ;
	svg.append("defs").append("clipPath")
  	  .attr("id", "clip")
  	;
	*/

	var svg = this.g.svg = d3.select(this.content[0]).append("svg:svg")
		.attr("class", "graphaxis")
		.attr("width", w)
		.attr("height", h + _hAxis)
		;
	svg.append("g")
				.attr("class", "axis x")
				.attr("transform", "translate(20," + (h) + ")")
				.call(xAxis);

	var canvas = this.g.canvas = d3.select(this.content[0]).append("canvas")
		.attr("width", w)
		.attr("height", 100)
		.attr("class", "graphchart")
		.node().getContext('2d')
		;

  	//.append("rect")
    //	.attr("width", w)
	  //  .attr("height", h);

	this.resolution = function(_) {
		//if (_resolution != this.scope.frequency()) {
		//	console.warn("The resolution of this widget does not correlate with the scope's frequency.");
		//}
		if (!arguments.length) return _resolution;
		_resolution = +_;
		return this;

	};

	this.autoscale = function(_) {
		if (!arguments.length) return _autoscale;
		_autoscale = (_ === true);
		return this;
	};

	/*
		var focus = this.g.focus = svg.append("g")
		.attr("class", "focus")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");
	*/

	this.refreshTimer = function() { return _refreshTimer; };

	this.realtime = function(_) {
		if (!arguments.length) return _realtime;

	  _realtime = (_ === true);

	  /*
	  // Might be necessary again, when the data update interval != GUI update interval
	  if (_realtime) {
	  	_refreshTimer = setInterval(this.refreshScale, 200, this);
	  } else {
	  	clearInterval(_refreshTimer);
	  }
	  */

	  return this;
	}; // realtime

};

Carmen.Graph.prototype = Object.create(Carmen.Widget.prototype);
Carmen.Graph.prototype.constructor = Carmen.Graph;


Carmen.Graph.prototype.accept = function() {
  var accept = [];
  accept.push(Carmen.ElementDataType.Analog);
  accept.push(Carmen.ElementDataType.Digital);
  // accept.push(Carmen.ElementDataType.StringUTF8);
  // accept.push(Carmen.ElementDataType.Complex);

  return accept;

};

Carmen.Graph.prototype.bind = function() {

  var data = this.elements();


	var w = this.g.w,
			h = this.g.h,
			x = this.g.x,
			xAxis = this.g.xAxis,
			focus = this.g.focus;

	// For each element ...

	var y = [];
	this.g.y = [];
	var yAxis = [];
	this.g.yAxis = [];
	var line = [];
	this.g.line = [];
	var area = [];
	this.g.area = [];

	for (i = 0; i < data.length; i++) {

		y[i] = this.g.y[i] = d3.scale.linear().range([h, 0]);

		// we need continues data with 60s timeing window
		data[i].setContinous(60000);
/*
		line[i] = this.g.line[i] = d3.svg.line()
			.x(function (d) {return x(d.time); })
			.y(function (d) {return y[i](d.value); })
			;
*/

/*
		focus.append("path")
			.datum(data)
			.attr("class", function(d) { return "line " + d[i].key; })
    	.attr("style", function(d) { return "stroke: " + d[i].color(); })
//		.attr("d", value)
			;
*/

	} // for



}; // bind

Carmen.Graph.prototype.refresh = function() {

	var w = this.g.w,
			h = this.g.h,
			x = this.g.x,
			xAxis = this.g.xAxis,
			// focus = this.g.canvas,
			canvas = this.g.canvas,
			svg = this.g.svg,

			area = this.g.area,
			line = this.g.line
			;

	var elements = this.elements();		// Convenience

	canvas.clearRect(0, 0, w, h);
	// canvas.transform(0,0,0,0,-2,0);

	var startTime = this.scope().startTime()*1000;
	var absTime = function( t)
	{
		return t/1000000 + startTime;// ns -> ms
	};

	// Realtime shows a window of (default) 1 minute of data.
	if (this.realtime()) {

		x.domain([new Date().getTime() - 60000, new Date()]);	// 1 Minute Scope

	} else {

		// !realtime shows the whole data set.

		// determine the first and last data point of all elements for correct scale
		var tMins = [];
		var tMaxs = [];
		for (i = 0; i < elements.length; i++) {
			var data = elements[i].data();
			if (data.length)
			{
				tMins.push(data[0].time);
				tMaxs.push(data[data.length - 1].time);
			}
		}
		var tMin = absTime(Math.min.apply(null, tMins));		
		var tMax = absTime(Math.max.apply(null, tMaxs));

		x.domain([tMin, tMax]);

	}	// realtime?

	svg.select(".axis.x").call(xAxis);


	for (i = 0; i < this.elements().length; i++) {

	  var element = this.elements()[i];
	  var data = element.data();
	  if (data.length)
	  {
		var y = this.g.y[i];

		// Todo: Min-Max values can be determined more efficiently!
		if (this.autoscale()) {
			y.domain(
							[d3.min(data.map(function(d) { return d.value; })),
							 d3.max(data.map(function(d) { return d.value; }))]
							 );
		} else {
			y.domain([element.definition.min,element.definition.max]);
		}

		canvas.beginPath();

		// Move brush to first element
		canvas.moveTo(x(absTime(data[0].time)), y(data[0].value));

		// Now paint the graph.
		var d;
		for (j=1; j<data.length; j++) {
			d = data[j];
			canvas.lineTo(x(absTime(d.time)), y(d.value));
		}

		canvas.lineWidth = 1;
		canvas.strokeStyle = element.color() || '#000000';
		canvas.stroke();
	 }
	 else
	 {
		console.log("data empty");
	 }

	}	// for each element

};

Carmen.Graph.prototype.type = function(d) {

  d.time = d.time; // parseDate(d.time);
  d.value = +d.value;
  return d;
};
