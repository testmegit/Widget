Carmen.Display = function(scope, container) {

  that = Carmen.Widget.call(this, scope, container);
  this.version = '0.0.1';
  this.description = 'Simple numeric or text based display, showing the latest value.';
  this.decimals = 2;

  // Todo
  // Color coding, e.g. negative values in red or values > 100 km/h in blue ...
  // Text Size


  this.datasource = null;

  this.bind();

  return this;
};

Carmen.Display.prototype = Object.create(Carmen.Widget.prototype);
Carmen.Display.prototype.constructor = Carmen.Display;

Carmen.Display.prototype.accept = function() {

  var accept = [];
  accept.push(Carmen.ElementDataType.Analog);
  accept.push(Carmen.ElementDataType.Digital);
  accept.push(Carmen.ElementDataType.StringUTF8);
  // accept.push(Carmen.ElementDataType.Complex);

  return accept;

};

Carmen.Display.prototype.bind = function() {
  // this.datasource = d3.select(this.container[0]).selectAll('.element').data(this.elements());
  var d = d3.select(this.content[0]).selectAll('.element').data(this.elements());

	d.enter()
		.append('div')
		.attr('class', 'element')
		.text(function(d) {
			return d.name + ": ";
		})
		.append('span')
    .attr('class', 'value')
    .attr('style', function(d) { return 'color: ' + d.color(); })
		.text(function(d) {
			return (d.data[d.data.length-1].value).toFixed(2) + " " + d.unit;
		});

};

Carmen.Display.prototype.refresh = function() {

  var d = d3.select(this.content[0]).selectAll('.element').data(this.elements());
		d.selectAll('.value')
		  .text(function(d) {
		      return (d.data[d.data.length-1].value).toFixed(2) + " " + d.unit;
		    });
    d.exit().remove();

};
