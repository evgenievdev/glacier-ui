(function( _core , utils , internal ) {

	//"use strict";
	var _prefix = internal.prefix();
	var _attribute = _prefix + "responsive";	// example: <div gls-responsive=">=m"> Content visible on medium sized screens or larger </div>
	var _static = _prefix + "static";
	var _modname = "responsive";

	// Expressions: "m" ; "s,m" ; "<m" ; "<=m" ; ">m" ; ">=m"	
	// Max widths (must be in ascending order)
	var _defaultScreens = {
		'xs': 320,
		's': 640,
		'm': 960,
		'l': 1280,
		'xl': -1 // -1 means infinity in this context
	};

	function findScreen( w , screens ) {
			 
		var i = 0;
		for( var s in screens ) {
		
			if( w <= screens[ s ] || screens[ s ] === -1 ) {
			
				return s;
			
			}
		
			i++;

		}
		
		return false;
	
	};

	function getVisibleScreensFromString( str , delimiter , defined ) {

		delimiter = delimiter || ",";
		var arr = str.split( delimiter );

		return getVisibleScreens( arr , defined );

	}

	function getScreensFromExpression( defined , target , ex ) {

		var s = [];
		var sign = 0;
		if( ex == "<" ) {
			sign = -1;
		} else if( ex == ">" ) {
			sign = 1;
		} else {	
			return s;
		}

		var e;
		var t = defined[target];
		// If the target is undefined, return an empty array
		if( t == undefined ) { return s; }

		for( var i in defined ) {

			e = defined[i];
			// If the current element is the target element, skip it
			if( i == target ) { continue; }
			// Check if the current element adheres to the criteria. If it does, add it to the array
			if( ( sign == -1 && ( (e < t && e > 0 && t > 0) || (e > t && e > 0 && t == -1) ) ) || 
			 	( sign == 1 && ( (e > t && e > 0 && t > 0) || (e < t && e == -1 && t > 0) ) ) 
			) {

				s.push( i );

			}

		}

		return s;

	}

	// Get the exploded string array with the screen sizes 
	function getVisibleScreens( arr , defined ) {

		var s = [];
		var n = arr.length;
		var nd = Object.keys(defined).length;
		var cs;

		// If there are no items or defined screens, return an empty array
		if( n == 0 || nd == 0 ) { return s; }
		// Otherwise if there is only one item, check if it is a mathematical expression
		else if( n == 1 ) {

			var ex = arr[0].trim();
			var el = ex.length;
			var c1 = ex.charAt(0);
			var c2 = ex.charAt(1);
			var ss = 0;
			if( c1 == "<" || c1 == ">" ) {

				if( c2 == "=" ) {
					ss = 2;
				} else {
					ss = 1;
				}
				cs = ex.substr( ss , el );

				// If this is a single value and it isn't in the defined list, return an empty array
				if( defined[cs] == undefined ) { return s; }
				// Otherwise the value is there and we need to find out which screen types are smaller/larger than this one.
				// First, if this screen is allowed in the expression, add it to the array
				if( ss === 2 ) { s.push( cs ); }
				// Then find all remaining screens smaller/larger than this one (depending on the expression sign)
				var b = getScreensFromExpression( defined , cs , c1 );
				// Add the result from the expression to the current array
				if( b.length && b.length > 0 ) { s = s.concat( b ); }
				// Then return the array
				return s;

			}  else {

				// If this is a single value and it isn't in the defined list, return an empty array
				if( defined[ex] == undefined ) { return s; }
				// Otherwise the value is in the list, so we add it to the array and return it.
				s.push(ex);
				return s;

			}

		}
		// Beyond 1 element, check each element if it is a valid screen size and add it to the array
		for( var i = 0 ; i < n; i++ ) {

			// Remove whitespace from each screen size
			cs = arr[i].trim();

			// No such screen size is defined => skip this element
			if( defined[cs] == undefined ) { continue; }

			// Add screen type to screens
			s.push( cs );

		}

		return s;

	}

	 
	function parseExpression( el , screens ) {

		var res = el.attr( _attribute ).split(",");
		res = getVisibleScreens( res , screens );
		return res;

	}

	function separateElements( list , screens ) {

		var res = {};
		for( var id in screens ) {
			res[id] = [];
		} 

		list.each( function(id) {

			var el = $( this );
			var visOn = parseExpression( el , screens );
			var cs;
			for( var i = 0 ; i < visOn.length; i++ ) {

				cs = visOn[i].trim();
				if( res[cs] == undefined) { continue; }
				res[cs].push( el );

			}

		});

		return res;

	}
 

	function updateResponsive( elements , wrapper , screens , events , cfg ) {

		if( !elements.length || elements.length <= 0 ) { return false; }
		events = events || {};
	 
		// Check the current screen dimensions against the setup screen definitions to determine which one it is
		var thisScreen = findScreen( wrapper.width() , screens );
		// Get an object containing arrays for each screen type with references to the elements attached to it
		var filtered = separateElements( elements , screens );

		// Attempt to execute any callbacks associated with particular screens
		if( typeof events.onScreen === 'object' ) {

			for( var id in screens ) {

				// If no callback is defined for this screen type, skip to the next one
				if( typeof events.onScreen[id] !== 'function' || filtered[id] == undefined ) { continue; }
   				// Execute the callback event for this screen type
				events.onScreen[id]( id , elements , filtered[id] );

			}
		}
 
		// Go through all elements and set their visibility according to their properties
		elements.each( function( id ) {
		
			var current = $( this );
			 	
			var visOn = parseExpression( current , screens );
			var isStatic = ( current.attr( _static ) == 'true');
 
			// Go through all screen size on which this element will be visible
		 	for( var i = 0 ; i < visOn.length; i++ ) {

		 		// Remove whitespace from each screen size
		 		var cs = visOn[i].trim();

		 		// See if the browser's screen size matches one of the screens setup for this element.
		 		// If it is, then make the element visible. Otherwise, hide it. 
		 		if( cs == thisScreen ) {
 					 
		 			if( cfg.toggleContent && !isStatic && current.is(":hidden") ) {
		 				current.stop(true,true).show(); 
		 			}
		 			if( typeof events.onShow == 'function' && current.is(":visible") ) {
		 				events.onShow( elements , current , cs );
		 			}
		 			break;

		 		} else {
 
		 			if( cfg.toggleContent && !isStatic && current.is(":visible") ) { 
		 				current.stop(true,true).hide(); 
		 			}
		 			if( typeof events.onShow == 'function' && current.is(":hidden") ) {
		 				events.onHide( elements , current , cs );
		 			}

		 		}

		 	}

			 
		
		} );

	}
 	
 	 
	var instance = function( settings ) {

		settings = settings || {};

		this.cfg = this.defaultSettings();
		utils.applyProperties( this.cfg , settings.options );

		this.events = {
			onResizeStart: false,
			onResizeEnd: false,
			onShow: false,
			onHide: false,
			onScreen: false
		};
		utils.applyProperties( this.events , settings.events );

		this.paused = false;
		this.screens = typeof settings.screens == 'object' ? settings.screens : _defaultScreens;
		
		this.setTarget( settings.target );
		this.setupSensor();

	}

	Object.assign( instance.prototype , {

		defaultSettings: function() {

			return {
				toggleContent: true,	// Set to false to use this instance as a sensor only which fires events
				dynamic: true
			};

		},

		setTarget: function( o ) {

			this.target = typeof o == 'string' ? $( o ) : o;

		},

		run: function() {

			if( typeof this.target !== 'object' ) { return false; }
			this.resume();
			this.getElements();
			this.update();
			return true;

		},

		pause: function() {
			this.paused = true;
		},

		resume: function() {
			this.paused = false;
		},

		setDynamic: function() {
			this.cfg.dynamic = true;
		},

		setStatic: function() {
			this.cfg.dynamic = false;
		},

		setupSensor: function() {

			this.removeSensor();

			this.sensor = new utils.resizeSensor( this.target , function(){
 				 
 				if( this.paused ) { return; }

	 			if( typeof this.events["onResizeStart"] === "function" ) {
					this.events["onResizeStart"]( this );
				}

				this.update();

				if( typeof this.events["onResizeEnd"] === "function" ) {
					this.events["onResizeEnd"]( this );
				}
		 
			}.bind(this) );

			// If an element is inserted/removed from the DOM within the target nest, execute the observer callback
			this.oberver = new utils.observeDOM( this.target , function(){

				// If the instance is not set to dynamic
				if( !this.cfg.dynamic ) { return; }
				this.pause();
				this.getElements();
				this.resume();

			}.bind(this));

		},

		removeSensor: function() {

			if( typeof this.sensor !== 'object' || typeof this.sensor.detach !== 'function' ) { return false; }
			this.sensor.detach( this.sensor );
			return true;

		},

		setScreens: function( o ) {

		},

		getElements: function() {

			this.elements = this.target.find('['+_attribute+']');

		},

		findScreen: function() {

			return findScreen( this.target.width() , this.screens );

		},

		update: function() {

			updateResponsive( this.elements , this.target , this.screens , this.events, this.cfg );

		}

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 