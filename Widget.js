Carmen.Widget = function(scope, container) {

  if (scope === undefined) console.warn('Elements should not be instanciated outside a scope. Use myscope.element.add("reference") instead.');

  if (!(scope instanceof Carmen.Scope)) throw new Error('Argument is not an instance of Carmen.Scope.');

  var _priv = 'private value';
  var _name = 'MyName';
  var _scope = scope;
  var _elements = [];
  var _online = false;


  this.container = container;
  this.content = {};
  this.id = ++iid;
  this.key = 'widget_' + this.id;
  this.version = '0.0.0';

  // Todo:
  // Allow multiple instances of elements inside one widget
  // Each instance of element may have a different render setting (e.g. text, numerical, ...)
  // Each instance may have a different visual setting (font size, color threshold, ...)
  // Visual properties, such as w/h (of content div), min dimensions, ...
  // Active (=polling data from scope) or suspended
  // Autoscale, manual scale
  // Option: Set everything to default (like text size, color coding, etc.)
  //         Widgets need to implement reset function

  this.name = function(_) {
    if (!arguments.length) return _name;
    _name = _;
    $(this.container).children('.name').text(_name);
    return this;
  };

  this.scope = function() {
    return _scope;
  };

  this.create = function() {

    this.cog = $('<div style="position: relative"><div class="btn cog"><i class="fa fa-cog"></i></div></div>');
    this.cog.click(this, function (e) { e.data.option(); });

    /*
    this.container = $('<div id="' + this.key + '" class="widget"></div>');
    this.heading = $('<div class="name">' + _name + '</div>');
    this.content = $('<div class="content"></div>');
    */

    if (this.container) {
      this.container.empty();
      this.container.addClass('widget');
      this.container.attr('id', this.key);
    } else {
      this.container = $('<div id="' + this.key + '" class="widget panel panel-default"></div>');
    }
    this.heading = $('<div class="name panel-heading panel-title">' + _name + '</div>');
    this.content = $('<div class="content panel-body"></div>');

    this.container.append(this.cog);

    // this.container.append(this.heading);
    this.container.append(this.content);

    // $('#engine').append(this.container);

  };

  this.delete = function() {
    console.log('Deleting Widget.');

    // Todo
    console.warn('Todo: Deleting every reference inside bound elements.');

  };

  
  this.online = function(_) {
    if (!arguments.length) return _online;

	if (_online!==_)
	{
		_online = _;

		// Refresh GUI Object
		if (_online) {
		  this.container.removeClass('offline');
		  this.container.addClass('online');
		} else {
		  this.container.removeClass('online');
		  this.container.addClass('offline');
		}
	}
    return this;

  };

  /****************************** ELEMENTS ************************/
  // Element Helper Functions (add, remove, ...)

  this.element = function(_) {
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
  this.element.widget = this;

  this.element.add = function(element) {

	// Check if Widget can display the element.
    if (this.widget.accept().indexOf(element.definition.datatype) == -1) {
      console.error("Accepted data types: ", this.widget.accept());
      throw new Error("Cannot add this element due to its data type.");
    }

    // Add this widget to elements' list
    element.widgets(this.widget);
	
    // Add element to this widget's list
    if (_elements.indexOf(element) == -1) {
      _elements.push(element);
      // this.widget.container.append('<div></div>')
      if (element.isInitialized()) this.widget.bind(this.widget);
	  // -> bind is called by element when it is initialized
    } else {
      console.warn('Trying to add duplicate element to current widget (Action: skipped)!', element);
      return false;
    }

    return this.widget;
  };

  this.element.remove = function(element) {

    // Remove element from this widget's list
    if (_elements.indexOf(element) != -1) {
      _elements.splice(_elements.indexOf(element),1);
      // if necessary, remove link from the other end as well.
      element.widget.remove(this.widget);
      this.widget.bind();
    }

    return this.widget;
  };


  this.elements = function(_) {
    if (!arguments.length) return _elements;
    if (!(_ instanceof Carmen.Scope.Element)) throw new Error('Argument is not an instance of Carmen.Scope.Element!');

    // Create reference to self inside element.
    console.warn('Not implemented.', _);
    /*
    if (_elements.indexOf(_) == -1) {
      return false;
      // _.scope = this;
      // _elements.push(_);
    } else {
      console.warn('Trying to add duplicate element to current widget (Action: skipped)!', _);
    }
    */
    return this;
  };

  this.create();

  return this;
}; // Widget

Carmen.Widget.prototype.option = function(caller) {

  caller = caller || this;

  $('#WidgetOptions .modal-body').hide();
  $('#WidgetOptions #WidgetOptionsGeneric').show();
  // if (this instanceof Carmen.Display) $('#WidgetOptions #WidgetOptionsDisplay').show();
  $('#WidgetOptionsLabel').text(caller.name());
  $('#WidgetOptions').modal();

};

Carmen.Widget.prototype.constructor = Carmen.Widget;
Carmen.Widget.prototype.shared = function() {
  return "shared function";
};

Carmen.Widget.prototype.accept = function() {
  debugger;
  throw new Error('This Method needs to be overwritten by the called Widget Class.', this);
};

Carmen.Widget.prototype.bind = function() {
  debugger;
  throw new Error('This Method needs to be overwritten by the called Widget Class.', this);
};

Carmen.Widget.prototype.refresh = function() {
  debugger;
  throw new Error('This Method needs to be overwritten by the called Widget Class.', this);
};
