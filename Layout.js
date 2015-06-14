Carmen.Container = function(base) {

  var _base = base;
  var _cid = 0;

  this.add = function(widths) {
    var containers = [];
    widths.forEach(function (width) {

      var outer = $('<div class="col-sm-' + width + '"></div>');
      var inner = $('<div class="panel panel-default" id="carmen_container_' + (++_cid) + '">Empty Container with id ' + _cid + '</div>');
      outer.append(inner);
      $(_base).append(outer);
      containers.push(inner);
    });
    return containers;
  };

  this.base = function(_) {
    if (!arguments.length) return _base;
    _base = _;
    return this;
  };

  return this;

};

Carmen.Container.prototype.constructor = Carmen.Container;
