Carmen.Display = function(scope, container) {

  var that = Carmen.Widget.call(this, scope, container);
  this.version = '0.0.1';
  this.description = 'Simple numeric or text based display, showing the latest value.';
  this.decimals = 2;

  // Todo
  // Color coding, e.g. negative values in red or values > 100 km/h in blue ...
  // Text Size

  var table = $('<table class="_table _table-condensed"><thead><tr><th>Name</th><th>Value</th></thead><tbody></tbody></table>');
  $(this.content[0]).append(table);

  this.datasource = null;

  this.bind();

  return this;
};

Carmen.Display.prototype = Object.create(Carmen.Widget.prototype);
Carmen.Display.prototype.constructor = Carmen.Display;

Carmen.Display.prototype.option = function() {
    var WidgetGeneric = Object.getPrototypeOf(Object.getPrototypeOf(this));
    WidgetGeneric.option(this);
    $('#WidgetOptions #WidgetOptionsDisplay').show();
};


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

  // var d = d3.select(this.content[0]).selectAll('.element').data(this.elements());
  var d = d3.select(this.content[0]).select('tbody').selectAll('tr').data(this.elements());

  var row = d.enter().append('tr').attr('class', 'element')
  row.append('td')
    .attr('class', 'name')
    .text(function(d) {
      return d.name + ": ";
    });

  row.append('td')
    .attr('class', 'value')
    .attr('style', function(d) { return 'color: ' + d.color()})
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
