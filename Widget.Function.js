Carmen.Image = function(scope, container) {

  that = Carmen.Widget.call(this, scope, container);
  this.version = '0.0.1';
  this.description = 'Simple image switcher, depending on a given value.';

  this.rule = {};

  // Todo
  // Color coding, e.g. negative values in red or values > 100 km/h in blue ...
  // Text Size

  this.datasource = null;

  this.bind();

  return this;
};

Carmen.Image.prototype = Object.create(Carmen.Widget.prototype);
Carmen.Image.prototype.constructor = Carmen.Image;

Carmen.Image.prototype.accept = function() {

  var accept = [];
  accept.push(Carmen.ElementDataType.Analog);
  accept.push(Carmen.ElementDataType.Digital);
  accept.push(Carmen.ElementDataType.StringUTF8);
  accept.push(Carmen.ElementDataType.Complex);

  return accept;

};

Carmen.Image.prototype.bind = function(that) {
  // this.datasource = d3.select(this.container[0]).selectAll('.element').data(this.elements());
  var d = d3.select(this.content[0]).selectAll('.element').data(this.elements());

	d.enter()
		.append('div')
		.attr('class', 'element')
		.text(function(d) {
			// return d.name + ": ";
      console.log(that.rule[d.key]);
		})
		.append('span')
    .attr('class', 'value')
    .attr('style', function(d) { return 'color: ' + d.color(); })
		.text(function(d) {
			return (d.data[d.data.length-1].value).toFixed(2) + " " + d.unit;
		});

};

Carmen.Image.prototype.refresh = function(that) {

  var d = d3.select(this.content[0]).selectAll('.element').data(this.elements());
		d.selectAll('.value')
		  .text(function(d) {
          var current = d.current();
          var rule = that.rule[d.key];
          var result;
          try {
            result = eval("(function() {" + rule + "})()") || false;
          } catch(err) {
            console.warn('Error while executing user defined rule: ' + err.message);
            result = err.message;
          }
          return result.toString();
		    });
    d.exit().remove();

};
