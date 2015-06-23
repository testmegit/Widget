Carmen.Bar = function(scope, container) {

  that = Carmen.Widget.call(this, scope, container);
  this.version = '0.0.1';
  this.description = 'Simple Bargraph display, showing the latest value.';
  this.decimals = 2;
  this.graphObject = null;

  // Todo
  // [ ] Color coding, e.g. negative values in red or values > 100 km/h in blue ...
  // [ ] Orientation; vertical or horizontal
  // [x] Autoscale (y) based on min/max of elements
  // [ ] Element description
  // [ ] Current values
  // [ ] History Min/Max as

  var w = 20,
      h = 100;

  var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, w]);

  var y = d3.scale.linear()
       .domain([0, 1])
       .rangeRound([0, h]);

  var chart = d3.select(this.content[0])
    .append("svg:svg")
      .attr("class", "barchart")
      .attr("width", 100)
      .attr("height", h);

  this.graphObject = {x: x, y: y, w: w, h: h, chart: chart};

  this.bind();

  return this;
};

Carmen.Bar.prototype = Object.create(Carmen.Widget.prototype);
Carmen.Bar.prototype.constructor = Carmen.Bar;

Carmen.Bar.prototype.color = function(color) {
  // this.graphObject.chart.selectAll('rect').attr("style", "fill: " + color + "; stroke: " + color);
  // return this;
  return this;
};

Carmen.Bar.prototype.accept = function() {

  var accept = [];
  accept.push(Carmen.ElementDataType.Analog);
  accept.push(Carmen.ElementDataType.Digital);
  // accept.push(Carmen.ElementDataType.StringUTF8);
  // accept.push(Carmen.ElementDataType.Complex);

  return accept;

};

Carmen.Bar.prototype.bind = function() {

  var data = this.elements();
  var g = this.graphObject;
  var chart = g.chart;

  g.x.domain([0, data.length])
  .range([0, data.length*(g.w + 6)]);

  var rect = chart.selectAll("rect").data(data);
  var line = chart.selectAll("line").data(data);

  // Resize in case of changes in data.length (more or fewer elements to display)
  chart.attr("width", (g.w + 6) * data.length);

  // Autoscale: Set Scale to (new) element range.
  var range = {min: 0, max: 0};
  data.forEach(function (e) {
    range.min = (e.definition.min < range.min) ? e.definition.min : range.min;
    range.max = (e.definition.max > range.max) ? e.definition.max : range.max;
  });
  g.y.domain([range.min, range.max]);

  // D3js Enter
  // Bar
  rect.enter().append("svg:rect")
       .attr("x", function(d, i) { return g.x(i); })
       .attr("y", function(d) { return g.h - g.y(d.currentValue()); })

       .attr("style", function(d) { return "fill: " + d.color() + "; stroke: " + d.color(); })

       .attr("width", g.w)
       .attr("height", function(d) { return g.y(d.currentValue()); });

  // "Whisker" (plotting the acutal max-value)
  line.enter().append("svg:line")
       .attr("x1", function(d, i) { return g.x(i) - 0.5; })
       .attr("x2", function(d, i) { return g.x(i) + 10; })
       .attr("y1", function(d) { return g.h - g.y(d.max) - 0.5; })
       .attr("y2", function(d) { return g.h - g.y(d.max) - 0.5; })
      ;

  this.graphObject.rect = rect;
  this.graphObject.line = line;

  // d.exit().transition().duration(1000).style("opacity",0).remove();

};

Carmen.Bar.prototype.refresh = function() {

  var data = this.elements();
  var g = this.graphObject;

  g.rect
    .transition().duration(200)
    .attr("y", function(d) 
	{ 
	return g.h - g.y(d.currentValue()) - 0.5; 
	})
    .attr("height", function(d) { return g.y(d.currentValue()); });

  g.line
       .attr("y1", function(d) { 
	   return g.h - g.y(d.max) - 0.5; 
	   })
       .attr("y2", function(d) { return g.h - g.y(d.max) - 0.5; })
      ;

  // d.exit().transition().duration(1000).style("opacity",0).remove();

};
