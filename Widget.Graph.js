// var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
// var parseDate = d3.time.format(".%S").parse;

Carmen.Graph = function(scope) {

	// Todo
	// [ ] Enhancement: Canvas statt SVG // Smooth scrolling ohne Neuzeichnen (CPU Load)
	// [ ] Bug: Update() fügt Duplicates ein
	// [ ] Axes
	// [ ] Mouse over
	// [ ]
	// [ ]
	// [ ]

	var _realtime = false;
	var _refreshTimer = {};
	var _autoscale = false;
	var _resolution = 1000;

  that = Carmen.Widget.call(this, scope);
  this.version = '0.0.1';
  this.description = 'Simple Graph display, showing the history of a value.';
  this.g = {};
	this.autoscale = false;


  var w = this.g.w = 800,
      h = this.g.h = 100;

	var x = this.g.x = d3.time.scale().range([0, w]);

/*	var xAxis = this.g.xAxis = d3.svg.axis().scale(x)
		.tickSize(-h)
		.tickFormat(d3.time.format("%H:%M"))
		.orient("bottom");
*/
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

	var canvas = this.g.canvas = d3.select(this.content[0]).append("canvas")
		.attr("width", w)
		.attr("height", h)
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

	  if (_realtime) {
	  	_refreshTimer = setInterval(this.refreshScale, 200, this);
	  } else {
	  	clearInterval(_refreshTimer);
	  }

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

			area = this.g.area,
			line = this.g.line
			;

	// canvas.clearRect(0, 0, w, h);
	canvas.transform(0,0,0,0,-2,0);

	for (i = 0; i < this.elements().length; i++) {

	  var element = this.elements()[i];
	  var data = element.data;

		var y = this.g.y[i];
				// yAxis = this.g.yAxis[i];

		if (!this.realtime()) {
			// Todo: extent can be determined more efficiently
			x.domain(d3.extent(data.map(function(d) { return d.time; })));
		}

		// Todo: Min-Max values can be determined more efficiently!
		if (this.autoscale()) {
			y.domain(
							[d3.min(data.map(function(d) { return d.value; })),
							 d3.max(data.map(function(d) { return d.value; }))]
							 );
		} else {
			y.domain([element.definition.min,element.definition.max]);
		}

		// focus.select(".line." + element.key).attr("d", line[i](data));

		// ----------------------------------------------------------------

		canvas.beginPath();

		d1 = data[data.length-2];
		d0 = data[data.length-1];

		canvas.moveTo(799, y(d1.value));
		canvas.lineTo(800, y(d0.value));

		canvas.lineWidth = 1;
		canvas.strokeStyle = element.color(); // '#000000';
		canvas.stroke();

	}

};

Carmen.Graph.prototype.refreshScale = function(that) {
/*
	var t1 = new Date();
	var t2 = new Date();
	t1.setTime(t1.getTime()-(that.g.w * that.resolution()));
	that.g.x.domain([t1, t2]);
	for (i = 0; i < that.elements().length; i++) {
		var element = that.elements()[i];
		if (that.g.line[i] !== undefined) {
			that.g.focus.select(".line."+element.key).attr("d", that.g.line[i](element.data));
		}
	}
*/
};

Carmen.Graph.prototype.type = function(d) {

  d.time = d.time; // parseDate(d.time);
  d.value = +d.value;
  return d;
};
