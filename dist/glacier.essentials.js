// ----------------------------------------------------------------------------------------
// Glacier-UI : Core
// ----------------------------------------------------------------------------------------
var Glacier = (function() {
			
	"use strict";
	
	// The prefix for all modules tags
	var _glacierPrefix = "gl-";

	var _moduleList = [];
 
	return {
		processors: {},
		internal: {
			prefix: function() { return _glacierPrefix; },
			// Define a module in the Glacier namespace (or define as module export)
			defineModule: function( name , instance , compilerTag , selector ) {
				if( typeof instance !== 'function' && typeof instance !== 'object' ) { return false; }
				if( this.moduleExists(name) ) { return false; }
				if (typeof exports === "object") {
					module.exports[name] = instance;
				} else {
					Glacier.modules[name] = instance;
				}
				_moduleList.push({
					name: name,
					tag: compilerTag,
					cssClass: selector
				});
				return true;
			},
			moduleList: function() {
				// Return a copy of the module list object (instead of a reference)
				return JSON.parse(JSON.stringify(_moduleList));
			},
			moduleExists: function(name) {
				for( var i = 0 ; i < _moduleList.length; i++ ) {
					if( _moduleList[i].name === name ) { return true; }
				}
				return false;
			},
			// Extract the attributes and values of any element into a JSON object. By default "class" and "id" are ignored
			attributes: function(el,prefix,ignore) {
				var r = {};
				if( typeof ignore !=='object' || !ignore.length ) {
					ignore = ["class","id"];
				}
				el.each(function() {
					$.each(this.attributes,function(i,a){
						if( ignore.indexOf(a.name) >= 0 ) { return; }
						if( typeof prefix == 'string' && a.name.split("-")[0].trim() !== prefix ) { return; }
						var val = a.value;
						if( val == "true" ) { val = true; }
						else if( val == "false" ) { val = false; }
						else if( !isNaN(val) ) { val =  Number(val); }
		            	r[a.name] = val;
		            });
				});
	            return r;
			}
		}
	};

})();

// ES6 Module support
if (typeof exports === "object") { 
	module.exports.core = Glacier; 
} else {
	Glacier.modules = {};
}


// ----------------------------------------------------------------------------------------
// Glacier-UI : Polyfills
// ----------------------------------------------------------------------------------------
(function(){

	// Object.assign polyfill
	if( Object !== undefined && typeof Object.assign !== 'function' ) {
		Object.assign = function( t , o ) {
			for( var p in o ) {
				t[p] = o[p];
			}
		}
	}
	// Object.keys polyfill
	if( Object !== undefined && typeof Object.keys !== 'function') {
		Object.keys = function( o ) {
			var a = [];
			for( var p in o ) {
				a.push(p);
			}
			return a;
		}
	}

	// Polyfill for Date.now() for older browsers (e.g. <IE9)
	if (!Date.now) {
	  Date.now = function now() {
	    return new Date().getTime();
	  };
	}

	 
	// Polyfill for requestAnimationFrame
	var timestep = 1000/60;
	window.requestAnimationFrame = window.requestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| (function() {
        var lastTimestamp = Date.now(),
            now,
            timeout;
        return function(callback) {
            now = Date.now();
            timeout = Math.max(0, timestep - (now - lastTimestamp));
            lastTimestamp = now + timeout;
            return setTimeout(function() {
                callback(now + timeout);
            }, timeout);
        };
    })(); // https://github.com/underscorediscovery/realtime-multiplayer-in-html5

	// Polyfill for cancelAnimationFrame
	window.cancelAnimationFrame = window.cancelAnimationFrame
	|| window.mozCancelAnimationFrame
	|| function(requestID){clearTimeout(requestID)} //fall back

})();
// ----------------------------------------------------------------------------------------
// Glacier-UI : Utilities
// ----------------------------------------------------------------------------------------
(function( _core ){

	 
	function isObject( o ) {
	
		if( o !== null && typeof o === 'object' ) {
			
			return true;
			
		}
		
		return false;
	
	}
	
	function hasProperty( o , p ) {
	
		if( o[ p ] == undefined ) {
		
			return false;
		
		}
		
		return true;
	
	}
	
	function isFunction( o ) {
		
		if( typeof o == "function" ) {
		
			return true;
		
		}
		
		return false;
		
	}
	
	function scrollWidth() {
	
		var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
			widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
			
		$outer.remove();
		
		return 100 - widthWithScroll;
		
	}

	function firstLetterToUppercase(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function toTitleCase(str) {
	    return str.replace(/\w\S*/g, function(txt){
	        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	}
	
	// Recursive; returns the context of a function from a string using namespace (e.g. "a.b.functionName")
	function getFunctionContext( func , context ) {
		
		var cut = func.split('.');
	 
		if( cut.length == 1 ) { 
			 
			context[ cut[0] ]();
			return;
 
		}
		
		var arr = [cut.shift(), cut.join('.')];
		 
		var c = context[ arr[0] ];

		getFunctionContext( arr[ 1 ] , c );
	
	}
	
	 
	function applyProperties( cfg , obj ) {
		
		for( var i in obj ) {
			if( cfg[i] == undefined ) { continue; }
			cfg[i] = obj[i];
		}
	
	}

	function clamp(v,min,max) {

  		return Math.min(Math.max(v, min), max);
 
	}

	function min(v) {
		return Math.min.apply(null,v);
	}

	function max(v) {
		return Math.max.apply(null,v);
	}

	function propertyRecursive( o , str , cur , lim ) {
  
		var res = o;
		for( var n = cur; n < lim; n++ ) {
		  
			if( res[ str[n] ] == undefined ) { return false; }
			res = res[ str[n] ];
		  

		}
		return res;
	  
	}

	var uuid = ( function () {

		// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

		var lut = [];

		for ( var i = 0; i < 256; i ++ ) {

			lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );

		}

		return function generateUUID() {

			var d0 = Math.random() * 0xffffffff | 0;
			var d1 = Math.random() * 0xffffffff | 0;
			var d2 = Math.random() * 0xffffffff | 0;
			var d3 = Math.random() * 0xffffffff | 0;
			var uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
				lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
				lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
				lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

			// .toUpperCase() here flattens concatenated strings to save heap memory space.
			return uuid.toUpperCase();

		};

	})();

	var observeDOM = (function(){
	  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	  return function( objs, callback ){

	  	objs.each(function(){
	  		var obj = this;
	  		if( !obj || !obj.nodeType === 1 ) return; // validation

		    if( MutationObserver ){
		      // define a new observer
		      var obs = new MutationObserver(function(mutations, observer){
		          callback(mutations);
		      })
		      // have the observer observe foo for changes in children
		      obs.observe( obj, { childList:true, subtree:true });
		    }
		    
		    else if( window.addEventListener ){
		      obj.addEventListener('DOMNodeInserted', callback, false);
		      obj.addEventListener('DOMNodeRemoved', callback, false);
		    }
	  	});

	     
	  }
	})();
 

	 

	// ----------------------------------------------------------------- Resize Sensor ------------------------------------------------------------------
 
	var sensor = (function(){

		/**
		 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
		 * directory of this distribution and at
		 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
		 */

		// Only used for the dirty checking, so the event callback count is limited to max 1 call per fps per sensor.
	    // In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
	    // would generate too many unnecessary events.
	    var requestAnimationFrame = window.requestAnimationFrame ||
	        window.mozRequestAnimationFrame ||
	        window.webkitRequestAnimationFrame ||
	        function (fn) {
	            return window.setTimeout(fn, 20);
	        };

	    /**
	     * Iterate over each of the provided element(s).
	     *
	     * @param {HTMLElement|HTMLElement[]} elements
	     * @param {Function}                  callback
	     */
	    function forEachElement(elements, callback){
	        var elementsType = Object.prototype.toString.call(elements);
	        var isCollectionTyped = ('[object Array]' === elementsType
	            || ('[object NodeList]' === elementsType)
	            || ('[object HTMLCollection]' === elementsType)
	            || ('[object Object]' === elementsType)
	            || ('undefined' !== typeof jQuery && elements instanceof jQuery) //jquery
	            || ('undefined' !== typeof Elements && elements instanceof Elements) //mootools
	        );
	        var i = 0, j = elements.length;
	        if (isCollectionTyped) {
	            for (; i < j; i++) {
	                callback(elements[i]);
	            }
	        } else {
	            callback(elements);
	        }
	    }

	    /**
	     * Class for dimension change detection.
	     *
	     * @param {Element|Element[]|Elements|jQuery} element
	     * @param {Function} callback
	     *
	     * @constructor
	     */
	    var ResizeSensor = function(element, callback) {
	        /**
	         *
	         * @constructor
	         */
	        function EventQueue() {
	            var q = [];
	            this.add = function(ev) {
	                q.push(ev);
	            };

	            var i, j;
	            this.call = function() {
	                for (i = 0, j = q.length; i < j; i++) {
	                    q[i].call();
	                }
	            };

	            this.remove = function(ev) {
	                var newQueue = [];
	                for(i = 0, j = q.length; i < j; i++) {
	                    if(q[i] !== ev) newQueue.push(q[i]);
	                }
	                q = newQueue;
	            }

	            this.length = function() {
	                return q.length;
	            }
	        }

	        /**
	         *
	         * @param {HTMLElement} element
	         * @param {Function}    resized
	         */
	        function attachResizeEvent(element, resized) {
	            if (!element) return;
	            if (element.resizedAttached) {
	                element.resizedAttached.add(resized);
	                return;
	            }

	            element.resizedAttached = new EventQueue();
	            element.resizedAttached.add(resized);

	            element.resizeSensor = document.createElement('div');
	            element.resizeSensor.className = 'resize-sensor';
	            var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
	            var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;';

	            element.resizeSensor.style.cssText = style;
	            element.resizeSensor.innerHTML =
	                '<div class="resize-sensor-expand" style="' + style + '">' +
	                    '<div style="' + styleChild + '"></div>' +
	                '</div>' +
	                '<div class="resize-sensor-shrink" style="' + style + '">' +
	                    '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' +
	                '</div>';
	            element.appendChild(element.resizeSensor);

	            if (element.resizeSensor.offsetParent !== element) {
	                element.style.position = 'relative';
	            }

	            var expand = element.resizeSensor.childNodes[0];
	            var expandChild = expand.childNodes[0];
	            var shrink = element.resizeSensor.childNodes[1];
	            var dirty, rafId, newWidth, newHeight;
	            var lastWidth = element.offsetWidth;
	            var lastHeight = element.offsetHeight;

	            var reset = function() {
	                expandChild.style.width = '100000px';
	                expandChild.style.height = '100000px';

	                expand.scrollLeft = 100000;
	                expand.scrollTop = 100000;

	                shrink.scrollLeft = 100000;
	                shrink.scrollTop = 100000;
	            };

	            reset();

	            var onResized = function() {
	                rafId = 0;

	                if (!dirty) return;

	                lastWidth = newWidth;
	                lastHeight = newHeight;

	                if (element.resizedAttached) {
	                    element.resizedAttached.call();
	                }
	            };

	            var onScroll = function() {
	                newWidth = element.offsetWidth;
	                newHeight = element.offsetHeight;
	                dirty = newWidth != lastWidth || newHeight != lastHeight;

	                if (dirty && !rafId) {
	                    rafId = requestAnimationFrame(onResized);
	                }

	                reset();
	            };

	            var addEvent = function(el, name, cb) {
	                if (el.attachEvent) {
	                    el.attachEvent('on' + name, cb);
	                } else {
	                    el.addEventListener(name, cb);
	                }
	            };

	            addEvent(expand, 'scroll', onScroll);
	            addEvent(shrink, 'scroll', onScroll);
	        }

	        forEachElement(element, function(elem){
	            attachResizeEvent(elem, callback);
	        });

	        this.detach = function(ev) {
	            ResizeSensor.detach(element, ev);
	        };
	    };

	    ResizeSensor.detach = function(element, ev) {
	        forEachElement(element, function(elem){
	            if (!elem) return
	            if(elem.resizedAttached && typeof ev == "function"){
	                elem.resizedAttached.remove(ev);
	                if(elem.resizedAttached.length()) return;
	            }
	            if (elem.resizeSensor) {
	                if (elem.contains(elem.resizeSensor)) {
	                    elem.removeChild(elem.resizeSensor);
	                }
	                delete elem.resizeSensor;
	                delete elem.resizedAttached;
	            }
	        });
	    };

	    return ResizeSensor;

	})();

	// Exposed methods
	_core.utils = {
		
		isObject: isObject,
		hasProperty: hasProperty,
		isFunction: isFunction,
		
		scrollWidth: scrollWidth,
		firstLetterToUppercase: firstLetterToUppercase,
		toTitleCase: toTitleCase,
		applyProperties: applyProperties,
		clamp: clamp,
		min: min,
		max: max,
		
		getFunctionContext: getFunctionContext,
		propertyRecursive: propertyRecursive,

		uuid: uuid,
		resizeSensor: sensor,
		observeDOM: observeDOM
		
	};

})( Glacier );
// ----------------------------------------------------------------------------------------
// Glacier-UI : Math
// ----------------------------------------------------------------------------------------
(function( _core ){

	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author philogb / http://blog.thejit.org/
	 * @author egraether / http://egraether.com/
	 * @author zz85 / http://www.lab4games.net/zz85/blog
	 */

	function Vector2( x, y ) {

		this.x = x || 0;
		this.y = y || 0;

	}

	Object.defineProperties( Vector2.prototype, {

		"width": {

			get: function () {

				return this.x;

			},

			set: function ( value ) {

				this.x = value;

			}

		},

		"height": {

			get: function () {

				return this.y;

			},

			set: function ( value ) {

				this.y = value;

			}

		}

	} );

	Object.assign( Vector2.prototype, {

		isVector2: true,

		set: function ( x, y ) {

			this.x = x;
			this.y = y;

			return this;

		},

		setScalar: function ( scalar ) {

			this.x = scalar;
			this.y = scalar;

			return this;

		},

		setX: function ( x ) {

			this.x = x;

			return this;

		},

		setY: function ( y ) {

			this.y = y;

			return this;

		},

		setComponent: function ( index, value ) {

			switch ( index ) {

				case 0: this.x = value; break;
				case 1: this.y = value; break;
				default: throw new Error( 'index is out of range: ' + index );

			}

			return this;

		},

		getComponent: function ( index ) {

			switch ( index ) {

				case 0: return this.x;
				case 1: return this.y;
				default: throw new Error( 'index is out of range: ' + index );

			}

		},

		clone: function () {

			return new this.constructor( this.x, this.y );

		},

		copy: function ( v ) {

			this.x = v.x;
			this.y = v.y;

			return this;

		},

		add: function ( v, w ) {

			if ( w !== undefined ) {

				console.warn( 'THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
				return this.addVectors( v, w );

			}

			this.x += v.x;
			this.y += v.y;

			return this;

		},

		addScalar: function ( s ) {

			this.x += s;
			this.y += s;

			return this;

		},

		addVectors: function ( a, b ) {

			this.x = a.x + b.x;
			this.y = a.y + b.y;

			return this;

		},

		addScaledVector: function ( v, s ) {

			this.x += v.x * s;
			this.y += v.y * s;

			return this;

		},

		sub: function ( v, w ) {

			if ( w !== undefined ) {

				console.warn( 'THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
				return this.subVectors( v, w );

			}

			this.x -= v.x;
			this.y -= v.y;

			return this;

		},

		subScalar: function ( s ) {

			this.x -= s;
			this.y -= s;

			return this;

		},

		subVectors: function ( a, b ) {

			this.x = a.x - b.x;
			this.y = a.y - b.y;

			return this;

		},

		multiply: function ( v ) {

			this.x *= v.x;
			this.y *= v.y;

			return this;

		},

		multiplyScalar: function ( scalar ) {

			this.x *= scalar;
			this.y *= scalar;

			return this;

		},

		divide: function ( v ) {

			this.x /= v.x;
			this.y /= v.y;

			return this;

		},

		divideScalar: function ( scalar ) {

			return this.multiplyScalar( 1 / scalar );

		},

		applyMatrix3: function ( m ) {

			var x = this.x, y = this.y;
			var e = m.elements;

			this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ];
			this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ];

			return this;

		},

		min: function ( v ) {

			this.x = Math.min( this.x, v.x );
			this.y = Math.min( this.y, v.y );

			return this;

		},

		max: function ( v ) {

			this.x = Math.max( this.x, v.x );
			this.y = Math.max( this.y, v.y );

			return this;

		},

		clamp: function ( min, max ) {

			// assumes min < max, componentwise

			this.x = Math.max( min.x, Math.min( max.x, this.x ) );
			this.y = Math.max( min.y, Math.min( max.y, this.y ) );

			return this;

		},

		clampScalar: function () {

			var min = new Vector2();
			var max = new Vector2();

			return function clampScalar( minVal, maxVal ) {

				min.set( minVal, minVal );
				max.set( maxVal, maxVal );

				return this.clamp( min, max );

			};

		}(),

		clampLength: function ( min, max ) {

			var length = this.length();

			return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

		},

		floor: function () {

			this.x = Math.floor( this.x );
			this.y = Math.floor( this.y );

			return this;

		},

		ceil: function () {

			this.x = Math.ceil( this.x );
			this.y = Math.ceil( this.y );

			return this;

		},

		round: function () {

			this.x = Math.round( this.x );
			this.y = Math.round( this.y );

			return this;

		},

		roundToZero: function () {

			this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
			this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );

			return this;

		},

		negate: function () {

			this.x = - this.x;
			this.y = - this.y;

			return this;

		},

		dot: function ( v ) {

			return this.x * v.x + this.y * v.y;

		},

		lengthSq: function () {

			return this.x * this.x + this.y * this.y;

		},

		length: function () {

			return Math.sqrt( this.x * this.x + this.y * this.y );

		},

		manhattanLength: function () {

			return Math.abs( this.x ) + Math.abs( this.y );

		},

		normalize: function () {

			return this.divideScalar( this.length() || 1 );

		},

		angle: function () {

			// computes the angle in radians with respect to the positive x-axis

			var angle = Math.atan2( this.y, this.x );

			if ( angle < 0 ) angle += 2 * Math.PI;

			return angle;

		},

		distanceTo: function ( v ) {

			return Math.sqrt( this.distanceToSquared( v ) );

		},

		distanceToSquared: function ( v ) {

			var dx = this.x - v.x, dy = this.y - v.y;
			return dx * dx + dy * dy;

		},

		manhattanDistanceTo: function ( v ) {

			return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y );

		},

		setLength: function ( length ) {

			return this.normalize().multiplyScalar( length );

		},

		lerp: function ( v, alpha ) {

			this.x += ( v.x - this.x ) * alpha;
			this.y += ( v.y - this.y ) * alpha;

			return this;

		},

		lerpVectors: function ( v1, v2, alpha ) {

			return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

		},

		equals: function ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) );

		},

		fromArray: function ( array, offset ) {

			if ( offset === undefined ) offset = 0;

			this.x = array[ offset ];
			this.y = array[ offset + 1 ];

			return this;

		},

		toArray: function ( array, offset ) {

			if ( array === undefined ) array = [];
			if ( offset === undefined ) offset = 0;

			array[ offset ] = this.x;
			array[ offset + 1 ] = this.y;

			return array;

		},

		fromBufferAttribute: function ( attribute, index, offset ) {

			if ( offset !== undefined ) {

				console.warn( 'THREE.Vector2: offset has been removed from .fromBufferAttribute().' );

			}

			this.x = attribute.getX( index );
			this.y = attribute.getY( index );

			return this;

		},

		rotateAround: function ( center, angle ) {

			var c = Math.cos( angle ), s = Math.sin( angle );

			var x = this.x - center.x;
			var y = this.y - center.y;

			this.x = x * c - y * s + center.x;
			this.y = x * s + y * c + center.y;

			return this;

		}

	} );




	/**************************************************************
	 *	Abstract Curve base class
	 **************************************************************/

	function Curve() {

		this.type = 'Curve';

		this.arcLengthDivisions = 200;

	}

	Object.assign( Curve.prototype, {

		// Virtual base class method to overwrite and implement in subclasses
		//	- t [0 .. 1]

		getPoint: function ( /* t, optionalTarget */ ) {

			console.warn( 'THREE.Curve: .getPoint() not implemented.' );
			return null;

		},

		// Get point at relative position in curve according to arc length
		// - u [0 .. 1]

		getPointAt: function ( u, optionalTarget ) {

			var t = this.getUtoTmapping( u );
			return this.getPoint( t, optionalTarget );

		},

		// Get sequence of points using getPoint( t )

		getPoints: function ( divisions ) {

			if ( divisions === undefined ) divisions = 5;

			var points = [];

			for ( var d = 0; d <= divisions; d ++ ) {

				points.push( this.getPoint( d / divisions ) );

			}

			return points;

		},

		// Get sequence of points using getPointAt( u )

		getSpacedPoints: function ( divisions ) {

			if ( divisions === undefined ) divisions = 5;

			var points = [];

			for ( var d = 0; d <= divisions; d ++ ) {

				points.push( this.getPointAt( d / divisions ) );

			}

			return points;

		},

		// Get total curve arc length

		getLength: function () {

			var lengths = this.getLengths();
			return lengths[ lengths.length - 1 ];

		},

		// Get list of cumulative segment lengths

		getLengths: function ( divisions ) {

			if ( divisions === undefined ) divisions = this.arcLengthDivisions;

			if ( this.cacheArcLengths &&
				( this.cacheArcLengths.length === divisions + 1 ) &&
				! this.needsUpdate ) {

				return this.cacheArcLengths;

			}

			this.needsUpdate = false;

			var cache = [];
			var current, last = this.getPoint( 0 );
			var p, sum = 0;

			cache.push( 0 );

			for ( p = 1; p <= divisions; p ++ ) {

				current = this.getPoint( p / divisions );
				sum += current.distanceTo( last );
				cache.push( sum );
				last = current;

			}

			this.cacheArcLengths = cache;

			return cache; // { sums: cache, sum: sum }; Sum is in the last element.

		},

		updateArcLengths: function () {

			this.needsUpdate = true;
			this.getLengths();

		},

		// Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant

		getUtoTmapping: function ( u, distance ) {

			var arcLengths = this.getLengths();

			var i = 0, il = arcLengths.length;

			var targetArcLength; // The targeted u distance value to get

			if ( distance ) {

				targetArcLength = distance;

			} else {

				targetArcLength = u * arcLengths[ il - 1 ];

			}

			// binary search for the index with largest value smaller than target u distance

			var low = 0, high = il - 1, comparison;

			while ( low <= high ) {

				i = Math.floor( low + ( high - low ) / 2 ); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats

				comparison = arcLengths[ i ] - targetArcLength;

				if ( comparison < 0 ) {

					low = i + 1;

				} else if ( comparison > 0 ) {

					high = i - 1;

				} else {

					high = i;
					break;

					// DONE

				}

			}

			i = high;

			if ( arcLengths[ i ] === targetArcLength ) {

				return i / ( il - 1 );

			}

			// we could get finer grain at lengths, or use simple interpolation between two points

			var lengthBefore = arcLengths[ i ];
			var lengthAfter = arcLengths[ i + 1 ];

			var segmentLength = lengthAfter - lengthBefore;

			// determine where we are between the 'before' and 'after' points

			var segmentFraction = ( targetArcLength - lengthBefore ) / segmentLength;

			// add that fractional amount to t

			var t = ( i + segmentFraction ) / ( il - 1 );

			return t;

		},

		// Returns a unit vector tangent at t
		// In case any sub curve does not implement its tangent derivation,
		// 2 points a small delta apart will be used to find its gradient
		// which seems to give a reasonable approximation

		getTangent: function ( t ) {

			var delta = 0.0001;
			var t1 = t - delta;
			var t2 = t + delta;

			// Capping in case of danger

			if ( t1 < 0 ) t1 = 0;
			if ( t2 > 1 ) t2 = 1;

			var pt1 = this.getPoint( t1 );
			var pt2 = this.getPoint( t2 );

			var vec = pt2.clone().sub( pt1 );
			return vec.normalize();

		},

		getTangentAt: function ( u ) {

			var t = this.getUtoTmapping( u );
			return this.getTangent( t );

		},

		clone: function () {

			return new this.constructor().copy( this );

		},

		copy: function ( source ) {

			this.arcLengthDivisions = source.arcLengthDivisions;

			return this;

		},

		toJSON: function () {

			var data = {
				metadata: {
					version: 4.5,
					type: 'Curve',
					generator: 'Curve.toJSON'
				}
			};

			data.arcLengthDivisions = this.arcLengthDivisions;
			data.type = this.type;

			return data;

		},

		fromJSON: function ( json ) {

			this.arcLengthDivisions = json.arcLengthDivisions;

			return this;

		}

	} );

	/**
	 * @author zz85 / http://www.lab4games.net/zz85/blog
	 *
	 * Bezier Curves formulas obtained from
	 * http://en.wikipedia.org/wiki/Bézier_curve
	 */

	function CatmullRom( t, p0, p1, p2, p3 ) {

		var v0 = ( p2 - p0 ) * 0.5;
		var v1 = ( p3 - p1 ) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	}


	function SplineCurve( points /* array of Vector2 */ ) {

		Curve.call( this );

		this.type = 'SplineCurve';

		this.points = points || [];

	}

	SplineCurve.prototype = Object.create( Curve.prototype );
	SplineCurve.prototype.constructor = SplineCurve;

	SplineCurve.prototype.isSplineCurve = true;

	SplineCurve.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new Vector2();

		var points = this.points;
		var p = ( points.length - 1 ) * t;

		var intPoint = Math.floor( p );
		var weight = p - intPoint;


		var p0 = points[ intPoint === 0 ? intPoint : intPoint - 1 ];
		var p1 = points[ intPoint ];
		var p2 = points[ intPoint > points.length - 2 ? points.length - 1 : intPoint + 1 ];
		var p3 = points[ intPoint > points.length - 3 ? points.length - 1 : intPoint + 2 ];

		point.set(
			CatmullRom( weight, p0.x, p1.x, p2.x, p3.x ),
			CatmullRom( weight, p0.y, p1.y, p2.y, p3.y )
		);

		return point;

	};

	SplineCurve.prototype.copy = function ( source ) {

		Curve.prototype.copy.call( this, source );

		this.points = [];

		for ( var i = 0, l = source.points.length; i < l; i ++ ) {

			var point = source.points[ i ];

			this.points.push( point.clone() );

		}

		return this;

	};

	SplineCurve.prototype.toJSON = function () {

		var data = Curve.prototype.toJSON.call( this );

		data.points = [];

		for ( var i = 0, l = this.points.length; i < l; i ++ ) {

			var point = this.points[ i ];
			data.points.push( point.toArray() );

		}

		return data;

	};

	SplineCurve.prototype.fromJSON = function ( json ) {

		Curve.prototype.fromJSON.call( this, json );

		this.points = [];

		for ( var i = 0, l = json.points.length; i < l; i ++ ) {

			var point = json.points[ i ];
			this.points.push( new Vector2().fromArray( point ) );

		}

		return this;

	};

	// Exposed methods
	_core.math = {

		Vector2: Vector2,
		Curve: Curve,
		SplineCurve: SplineCurve

	};


})( Glacier );
(function( _core , utils , internal ){
	
	var _modname = "compiler";
	var _prefix = internal.prefix();
 	// Loaded module instances are stored in this object.
	var loaded = {};
	
	function process_module( id ) {
		
		var modules = internal.moduleList();
		if( id < 0 && id >= modules.length ) { return false; }
		var mod = modules[ id ];
		// If this module doesn't have a processor method, exit
		if( typeof _core.processors[ mod.name ] !== 'function' ) { return false; }
		// Execute the module's processor
		return _core.processors[ mod.name ]( _prefix , mod.tag , mod.cssClass );
	
	};
	
	function compile(debug) {
		
		if( debug ) {
			console.log("Glacier compiler - modules loaded:");
		}
		var modules = internal.moduleList();
		var mod, instances, t0 , t1 , dt;
		for( var i = 0 ; i < modules.length ; i++ ) {
	
			mod = modules[ i ];
			
			t0 = performance.now();
			instances = process_module( i );			
			t1 = performance.now();
			// skip this module if it is not imported 
			if( instances === false ) { continue; }
			loaded[ mod.name ] = instances;
			dt = t1 - t0;
			
			if( debug ) {
				console.log('%c ' + mod.name + ": " + loaded[ mod.name ].length +" ("+dt.toFixed(4)+"ms)", 'background: hsl( '+360/modules.length * i+', 50% , 50%); color: #fff; padding:2px;');
			}

		}	

		
	};
	
	// This runs silently in the background checking for changes in the dom
	function updater() {
	
	}
 	
 	// Public methods for the compiler
	_core[_modname] = {

		run: function(debug) {

			compile(debug);

		},

		update: function() {
			
			updater();

		},

		loadedModules: function() {

			return loaded;

		},

		moduleInstance: function(name,id) {

			var o = loaded[name];
			if( o == undefined || id < 0 || id >= o.length ) { return false; }
			return o[id];

		},	

		// Get rid of currently active modules
		flush: function() {

			var m,inst;
			for( var id in loaded ) {
				m = loaded[m];
				for( var i = 0; i < m.length; i++ ) {
					inst = m[i];
					if( typeof inst.destroy !== 'function' ) {continue;}
					// Every module with a processor should ideally have a destroy method.
					inst.destroy();
					
				}
			}
			// Reset loaded object
			loaded = {};

		}

	};
 
	
})( Glacier , Glacier.utils , Glacier.internal );
 
 
(function( _core , utils , internal ) {

	//"use strict";
 	var _modname = "css";
 	var _modname2 = "themer";

 	var _regex = /\[\[([^\]\]]+)\]\]/gi;	// Global , Case-insensitive

 	var _regexShortcuts = new RegExp('##([^##]+)##','gi');	// Global , Case-insensitive
 	// A list of shortcut keywords which can be used with a regex to allow the developer to quickly edit CSS properties, without having to define every specific variant of the CSS classes
 	var _shortcuts = {
 		"button": [".glacier .button"]
 	};

 	// -------------------------------------------------------------------------------------------------------------------------

 	var _iteratorShortcuts = function(match, p1, p2, p3, offset, string) {

			var trimmed = match.substr( 2 , match.length-4 ).trim();

		var c = trimmed.split(":");
		var key = c[0];
		var addon = c.length <= 1 ? '' : ":"+c[1].trim();
		// If the shortcut key doesn't exist in the defined keys list, don't attempt to replace anything for this match
		if( _shortcuts[key] == undefined ) {
			return match;
		}
		// Otherwise, compile a string of all classes attached to the 
		var classes = _shortcuts[key];
		if( !classes.length && typeof classes == 'string' ) {
			classes = [classes];
		}
		var res = '';
		for( var i = 0 ; i < classes.length; i++ ) {

			if( i > 0 ) { res+=','; }
			res += classes[i] + addon;
	 
		}
	 
		return res;

	};

	var _iteratorValues = function(match, p1, p2, p3, offset, string){
		
		// p1 is nondigits, p2 digits, and p3 non-alphanumerics

		// Get rid of the variable tags for the current match
		var trimmed = match.substr( 2 , match.length-4 );
		// Added support for multi-nested objects. E.g. "lang.level1.level2.property" is acceptable
		var c = trimmed.split(".");
		// But not only nested. Sometimes the first level is sufficient. Therefore we need to make that distinction
		var ref = c.length <= 1 ? this.data[ c[0] ] : utils.propertyRecursive( this.data , c , 0 , c.length );
		
		// Allow for custom methods to be set as properties by calling the associated method and set its returned value(s) as this one
		if( typeof ref == "function" ) {
			var varName = c[ c.length-1 ]; // The name of the variable in terms of its relative position in the data object (i.e. the property name)
			ref = ref( varName );
		}

		// If no reference is found within the template data, 
		if( ref == undefined || ref == false ) { return ""; }

		return ref;

	};

 	var parseCSS = function( data , rules ) {

 		var fixed = rules.replace( _regexShortcuts , _iteratorShortcuts );
		var code = fixed.replace( _regex , _iteratorValues.bind({ data: data }) );
		return code;

 	};

 	var buildStyle = function(id,data) {
 		// Create a <style> element and set its css data to match the parsed data.
		var css = $('<style>');  
		css.attr("type","text/css"); 
		css.attr("id", id ); 
		css.text( data );
		return css;
 	}

 	// -------------------------------------------------------------------------------------------------------------------------

 	var parser = function() {

 		this.templates = {};
 		this.stylesheets = {};

 	}

 	Object.assign( parser.prototype , {

 		exists: function(id) {

 			if( this.stylesheets[id] !== undefined && typeof this.stylesheets[id] === 'object' ) {
 				return true;
 			}
 			return false;

 		},

 		extractVariables: function( data ) {

 			var matches = data.match( _regex );
 			if( matches == null ) { return matches; }
 			// Remove the brackets from the variable matches.
 			for( var i = 0 ; i < matches.length; i++ ) {
 				matches[i] = matches[i].replace(/\[/g,'').replace(/\]/g,'');
 			}
 			return matches;

 		},

 		parse: function( data , rules ) { 
 			
 			return parseCSS(data,rules);

 		},

 		inject: function( id , data , rules , target , prepend ) {

 			// Parse the raw css rulesets 
 			var parsed = this.parse( data , rules );
 			// Create a <style> element and set its css data to match the parsed data.
 			var css = buildStyle(id,parsed);
			// If this stylesheet ID is already taken, remove the current style from the DOM first
			if( this.exists(id) ) {
 				this.stylesheets[id].parsed.remove();
 			}
 			// Then inject the new style
			this.stylesheets[id] = {
				
				raw: rules,				// Raw css data with variables intact
				parsed: css,			// Style element of parsed css data after replacing variables with values
				parent: target			// The target where this stylesheet is injected

			};
			// In some cases you may wish to alter the order of injection. Prepending will add the style at the very top of the target element. Appending - at the bottom.
			var func = prepend == true ? "prependTo" : "appendTo";
			css[func]( target );

 		},

 		/**
 		*	
 		*/
 		append: function( id , data , rules ) {

 			// You can't append css to a non-existing stylesheet. Therefore exit early and return false
 			if( !this.exists(id) ) { return false; }
 			// Parse the raw css rulesets 
 			var parsed = this.parse( data , rules );
 			// Inject rulesets into existing stylesheet
 			this.stylesheets[id].parsed.append( parsed );
 			// Once the css has been injected, return true to show that the method call is successful.
 			return true;

 		},

 		remove: function( id ) {

 			if( !this.exists(id) ) { return false; }
 			this.stylesheets[id].parsed.remove();
 			delete this.stylesheets[id];
 			return true;

 		} 

 	});

 	// ------------------------------------------------------------ THEMER MODULE ---------------------------------------------

 	var themer = function( cfg ) {

 		cfg = cfg || {};
 
 		// Create an instance of the CSS parser
 		this.engine = new parser();
 		// Theme stylesheet (template)
 		this.template = false;
 		// The stylesheet object
 		this.stylesheet = false;
 		this.setTemplate( cfg.template );
 		// Various themes
 		this.themes = {};
 		this.active = false;
 		// User-defined event callbacks
 		this.events = {
 			onThemeChange: false,
 			onThemeCompile: false
 		};
 		utils.applyProperties( this.events , cfg.events );

 	}

 	Object.assign( themer.prototype , {

 		getThemes: function() {
 			return Object.keys( this.themes );
 		},
 		change: function( delta ) {
 			var themes = this.getThemes();
 			var cID = themes.indexOf( this.active );
 			if( cID < 0 ) { return false; }
 			// -1 = Previous. If the current theme is the first one, there is no previous theme
 			if( delta == -1 && cID < 1 ) { return false; }
 			if( delta == 1 && cID >= themes.length-1 ) { return false; }
 			if( delta == "first" ) { return this.apply( themes[0] ); }
 			if( delta == "last" ) { return this.apply( themes[ themes.length-1 ] ); }
 			return this.apply( themes[ cID + delta ] );
 		},
 		next: function() {
 			return this.change(1);
 		},
 		previous: function() {
 			return this.change(-1);
 		},
 		first: function() {
 			return this.change("first");
 		},
 		last: function() {
 			return this.change("last");
 		},
 		setTemplate: function( rules ) {
 			if( typeof rules !== 'string' ) { return false; }
 			this.template = rules;
 			return true;
 		},
 		loadTemplate: function( file , onLoad , onFail ) {
 			$.ajax({
			  method: "GET",
			  url: file,
			  dataType: "text"
			})
			.done( function(data){
				this.setTemplate( data );
				if( typeof onLoad ==='function'){ onLoad(); }
			}.bind(this))
			.fail(function(){
				console.log("Stylesheet ["+file+"] could not be loaded");
				if( typeof onFail ==='function'){ onFail(); }
			}.bind(this));
 		},
 		exists: function( id ) {
 			if( this.themes[id] == undefined && typeof this.themes[id] !== 'object' ) { return false; }
 			return true;
 		}, 
 		remove: function( id ) {
 			if( !this.exists(id) ) { return false; }
 			if( this.active === id && typeof this.stylesheet === 'object' ) {
 				this.stylesheet.remove();
 				this.active = false;
 			}
 			delete this.themes[id];
 			return true;
 		},
 		clear: function( id ) {
 			if( this.active == false || !this.exists( this.active ) ) { return false; }
			this.engine.remove( this.active );
			this.active = false;			 
 			return true;
 		},
 		define: function( id , data ) {
 			if( this.exists(id) || typeof data !== 'object' ) { return false; }
 			this.themes[id] = {
 				data: data,
 				compiled: false
 			}
 			this.compile( id );
 			return true;
 		},
 		set: function( id , data ) {
 			if( !this.exists(id) ) { return false; }
 			this.themes[id].data = data;
 			this.compile( id );
 			return true;
 		},
 		compile: function( id ) {
 			if( !this.exists(id) 
 				|| typeof this.themes[id].data !== 'object' 
 				|| typeof this.template !== 'string'
 			) { return false; }
 			var parsed = parseCSS( this.themes[id].data , this.template );
 			this.themes[id].compiled = parsed;
 			return true;
 		},
 		apply: function( id , target ) {
 			if( !this.exists(id) || typeof this.themes[id].compiled !== 'string' ) { return false; }
 			if( typeof target == 'string') { target = $(target); }
 			else if( target == undefined ) { target = $("head"); }
 			var theme = this.themes[id];
 			if( typeof this.stylesheet === 'object' && typeof this.stylesheet.text === 'function' ) {
 				this.stylesheet.text( theme.compiled );
 			} else {
 				this.stylesheet = buildStyle( id , theme.compiled );
 				this.stylesheet.appendTo( target );
 			}
 			this.active = id;
 			return true;
 		}

 	});

 	internal.defineModule( _modname , parser );
 	internal.defineModule( _modname2 , themer );
	 
})( Glacier , Glacier.utils , Glacier.internal );


 (function( _core , utils , internal ) {

	//"use strict";
	var _modname = "filter";
 
	var instance = function( target , options, events ) {
 		
 		this.target = typeof target == 'string' ? $( target ) : target;
 
 		this.cfg = this.defaultSettings();
 		utils.applyProperties( this.cfg , options );
 
 		this.events = {
			 
		};
		utils.applyProperties( this.events , events );

		this.data = {};
		this.getElements();
		this.apply(true);

	}

	Object.assign( instance.prototype , {

		defaultSettings:function(){
		 	return {
		 		elementSelector: ".item"
		 	};
		},

		getElements: function() {

			//var es = this.cfg.elementSelector;
			var list = this.target.find("[gls-filter]");
			if( list.length <= 0 ) { return false; }
			this.data = {};

			list.each( function(id){
				
				var el = $(list[id]);
				var cat = el.attr("gls-filter");
				if( cat == undefined ) { return; }
				if( !this.filterExists(cat) ) { this.data[cat] = []; }
				this.data[cat].push( el );
 
			}.bind(this));

			this.apply( true );

		},

		apply: function( visible , exclude ) {

			// If visible is set to true, get all possible filter categories and show them
			if( visible == true ) { 
				visible = Object.keys( this.data );
			} 
			if( !visible.length ) { visible = [visible]; }
			var items,show;
			for( var id in this.data ) {
				items = this.data[id];
				show = visible.indexOf(id) < 0 ? false : true;
				if( exclude == true ) { show=!show; }

				this.toggleItems(id,show);
			}

		},

		toggleItems: function(id,show) {
			if( !this.filterExists(id) || !this.data[id].length ) { return false; }
			for( var i = 0 ; i < this.data[id].length; i++ ) {
				if( show == true ) { this.data[id][i].fadeIn(300); }
				else { this.data[id][i].fadeOut(300); }
			}
		},

		filterExists: function(id) {
			if( this.data[id] == undefined ) { return false; }
			return true;
		} 

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 
(function( _core , utils , internal ) {

	//"use strict";
 

	/**
	 * @author Phil Teare
	 * using wikipedia data
	 */
	var isoLangs = {
	    "ab":{
	        "name":"Abkhaz",
	        "nativeName":"аҧсуа"
	    },
	    "aa":{
	        "name":"Afar",
	        "nativeName":"Afaraf"
	    },
	    "af":{
	        "name":"Afrikaans",
	        "nativeName":"Afrikaans"
	    },
	    "ak":{
	        "name":"Akan",
	        "nativeName":"Akan"
	    },
	    "sq":{
	        "name":"Albanian",
	        "nativeName":"Shqip"
	    },
	    "am":{
	        "name":"Amharic",
	        "nativeName":"አማርኛ"
	    },
	    "ar":{
	        "name":"Arabic",
	        "nativeName":"العربية"
	    },
	    "an":{
	        "name":"Aragonese",
	        "nativeName":"Aragonés"
	    },
	    "hy":{
	        "name":"Armenian",
	        "nativeName":"Հայերեն"
	    },
	    "as":{
	        "name":"Assamese",
	        "nativeName":"অসমীয়া"
	    },
	    "av":{
	        "name":"Avaric",
	        "nativeName":"авар мацӀ, магӀарул мацӀ"
	    },
	    "ae":{
	        "name":"Avestan",
	        "nativeName":"avesta"
	    },
	    "ay":{
	        "name":"Aymara",
	        "nativeName":"aymar aru"
	    },
	    "az":{
	        "name":"Azerbaijani",
	        "nativeName":"azərbaycan dili"
	    },
	    "bm":{
	        "name":"Bambara",
	        "nativeName":"bamanankan"
	    },
	    "ba":{
	        "name":"Bashkir",
	        "nativeName":"башҡорт теле"
	    },
	    "eu":{
	        "name":"Basque",
	        "nativeName":"euskara, euskera"
	    },
	    "be":{
	        "name":"Belarusian",
	        "nativeName":"Беларуская"
	    },
	    "bn":{
	        "name":"Bengali",
	        "nativeName":"বাংলা"
	    },
	    "bh":{
	        "name":"Bihari",
	        "nativeName":"भोजपुरी"
	    },
	    "bi":{
	        "name":"Bislama",
	        "nativeName":"Bislama"
	    },
	    "bs":{
	        "name":"Bosnian",
	        "nativeName":"bosanski jezik"
	    },
	    "br":{
	        "name":"Breton",
	        "nativeName":"brezhoneg"
	    },
	    "bg":{
	        "name":"Bulgarian",
	        "nativeName":"български език"
	    },
	    "my":{
	        "name":"Burmese",
	        "nativeName":"ဗမာစာ"
	    },
	    "ca":{
	        "name":"Catalan; Valencian",
	        "nativeName":"Català"
	    },
	    "ch":{
	        "name":"Chamorro",
	        "nativeName":"Chamoru"
	    },
	    "ce":{
	        "name":"Chechen",
	        "nativeName":"нохчийн мотт"
	    },
	    "ny":{
	        "name":"Chichewa; Chewa; Nyanja",
	        "nativeName":"chiCheŵa, chinyanja"
	    },
	    "zh":{
	        "name":"Chinese",
	        "nativeName":"中文 (Zhōngwén), 汉语, 漢語"
	    },
	    "cv":{
	        "name":"Chuvash",
	        "nativeName":"чӑваш чӗлхи"
	    },
	    "kw":{
	        "name":"Cornish",
	        "nativeName":"Kernewek"
	    },
	    "co":{
	        "name":"Corsican",
	        "nativeName":"corsu, lingua corsa"
	    },
	    "cr":{
	        "name":"Cree",
	        "nativeName":"ᓀᐦᐃᔭᐍᐏᐣ"
	    },
	    "hr":{
	        "name":"Croatian",
	        "nativeName":"hrvatski"
	    },
	    "cs":{
	        "name":"Czech",
	        "nativeName":"česky, čeština"
	    },
	    "da":{
	        "name":"Danish",
	        "nativeName":"dansk"
	    },
	    "dv":{
	        "name":"Divehi; Dhivehi; Maldivian;",
	        "nativeName":"ދިވެހި"
	    },
	    "nl":{
	        "name":"Dutch",
	        "nativeName":"Nederlands, Vlaams"
	    },
	    "en":{
	        "name":"English",
	        "nativeName":"English"
	    },
	    "eo":{
	        "name":"Esperanto",
	        "nativeName":"Esperanto"
	    },
	    "et":{
	        "name":"Estonian",
	        "nativeName":"eesti, eesti keel"
	    },
	    "ee":{
	        "name":"Ewe",
	        "nativeName":"Eʋegbe"
	    },
	    "fo":{
	        "name":"Faroese",
	        "nativeName":"føroyskt"
	    },
	    "fj":{
	        "name":"Fijian",
	        "nativeName":"vosa Vakaviti"
	    },
	    "fi":{
	        "name":"Finnish",
	        "nativeName":"suomi, suomen kieli"
	    },
	    "fr":{
	        "name":"French",
	        "nativeName":"français, langue française"
	    },
	    "ff":{
	        "name":"Fula; Fulah; Pulaar; Pular",
	        "nativeName":"Fulfulde, Pulaar, Pular"
	    },
	    "gl":{
	        "name":"Galician",
	        "nativeName":"Galego"
	    },
	    "ka":{
	        "name":"Georgian",
	        "nativeName":"ქართული"
	    },
	    "de":{
	        "name":"German",
	        "nativeName":"Deutsch"
	    },
	    "el":{
	        "name":"Greek, Modern",
	        "nativeName":"Ελληνικά"
	    },
	    "gn":{
	        "name":"Guaraní",
	        "nativeName":"Avañeẽ"
	    },
	    "gu":{
	        "name":"Gujarati",
	        "nativeName":"ગુજરાતી"
	    },
	    "ht":{
	        "name":"Haitian; Haitian Creole",
	        "nativeName":"Kreyòl ayisyen"
	    },
	    "ha":{
	        "name":"Hausa",
	        "nativeName":"Hausa, هَوُسَ"
	    },
	    "he":{
	        "name":"Hebrew (modern)",
	        "nativeName":"עברית"
	    },
	    "hz":{
	        "name":"Herero",
	        "nativeName":"Otjiherero"
	    },
	    "hi":{
	        "name":"Hindi",
	        "nativeName":"हिन्दी, हिंदी"
	    },
	    "ho":{
	        "name":"Hiri Motu",
	        "nativeName":"Hiri Motu"
	    },
	    "hu":{
	        "name":"Hungarian",
	        "nativeName":"Magyar"
	    },
	    "ia":{
	        "name":"Interlingua",
	        "nativeName":"Interlingua"
	    },
	    "id":{
	        "name":"Indonesian",
	        "nativeName":"Bahasa Indonesia"
	    },
	    "ie":{
	        "name":"Interlingue",
	        "nativeName":"Originally called Occidental; then Interlingue after WWII"
	    },
	    "ga":{
	        "name":"Irish",
	        "nativeName":"Gaeilge"
	    },
	    "ig":{
	        "name":"Igbo",
	        "nativeName":"Asụsụ Igbo"
	    },
	    "ik":{
	        "name":"Inupiaq",
	        "nativeName":"Iñupiaq, Iñupiatun"
	    },
	    "io":{
	        "name":"Ido",
	        "nativeName":"Ido"
	    },
	    "is":{
	        "name":"Icelandic",
	        "nativeName":"Íslenska"
	    },
	    "it":{
	        "name":"Italian",
	        "nativeName":"Italiano"
	    },
	    "iu":{
	        "name":"Inuktitut",
	        "nativeName":"ᐃᓄᒃᑎᑐᑦ"
	    },
	    "ja":{
	        "name":"Japanese",
	        "nativeName":"日本語 (にほんご／にっぽんご)"
	    },
	    "jv":{
	        "name":"Javanese",
	        "nativeName":"basa Jawa"
	    },
	    "kl":{
	        "name":"Kalaallisut, Greenlandic",
	        "nativeName":"kalaallisut, kalaallit oqaasii"
	    },
	    "kn":{
	        "name":"Kannada",
	        "nativeName":"ಕನ್ನಡ"
	    },
	    "kr":{
	        "name":"Kanuri",
	        "nativeName":"Kanuri"
	    },
	    "ks":{
	        "name":"Kashmiri",
	        "nativeName":"कश्मीरी, كشميري‎"
	    },
	    "kk":{
	        "name":"Kazakh",
	        "nativeName":"Қазақ тілі"
	    },
	    "km":{
	        "name":"Khmer",
	        "nativeName":"ភាសាខ្មែរ"
	    },
	    "ki":{
	        "name":"Kikuyu, Gikuyu",
	        "nativeName":"Gĩkũyũ"
	    },
	    "rw":{
	        "name":"Kinyarwanda",
	        "nativeName":"Ikinyarwanda"
	    },
	    "ky":{
	        "name":"Kirghiz, Kyrgyz",
	        "nativeName":"кыргыз тили"
	    },
	    "kv":{
	        "name":"Komi",
	        "nativeName":"коми кыв"
	    },
	    "kg":{
	        "name":"Kongo",
	        "nativeName":"KiKongo"
	    },
	    "ko":{
	        "name":"Korean",
	        "nativeName":"한국어 (韓國語), 조선말 (朝鮮語)"
	    },
	    "ku":{
	        "name":"Kurdish",
	        "nativeName":"Kurdî, كوردی‎"
	    },
	    "kj":{
	        "name":"Kwanyama, Kuanyama",
	        "nativeName":"Kuanyama"
	    },
	    "la":{
	        "name":"Latin",
	        "nativeName":"latine, lingua latina"
	    },
	    "lb":{
	        "name":"Luxembourgish, Letzeburgesch",
	        "nativeName":"Lëtzebuergesch"
	    },
	    "lg":{
	        "name":"Luganda",
	        "nativeName":"Luganda"
	    },
	    "li":{
	        "name":"Limburgish, Limburgan, Limburger",
	        "nativeName":"Limburgs"
	    },
	    "ln":{
	        "name":"Lingala",
	        "nativeName":"Lingála"
	    },
	    "lo":{
	        "name":"Lao",
	        "nativeName":"ພາສາລາວ"
	    },
	    "lt":{
	        "name":"Lithuanian",
	        "nativeName":"lietuvių kalba"
	    },
	    "lu":{
	        "name":"Luba-Katanga",
	        "nativeName":""
	    },
	    "lv":{
	        "name":"Latvian",
	        "nativeName":"latviešu valoda"
	    },
	    "gv":{
	        "name":"Manx",
	        "nativeName":"Gaelg, Gailck"
	    },
	    "mk":{
	        "name":"Macedonian",
	        "nativeName":"македонски јазик"
	    },
	    "mg":{
	        "name":"Malagasy",
	        "nativeName":"Malagasy fiteny"
	    },
	    "ms":{
	        "name":"Malay",
	        "nativeName":"bahasa Melayu, بهاس ملايو‎"
	    },
	    "ml":{
	        "name":"Malayalam",
	        "nativeName":"മലയാളം"
	    },
	    "mt":{
	        "name":"Maltese",
	        "nativeName":"Malti"
	    },
	    "mi":{
	        "name":"Māori",
	        "nativeName":"te reo Māori"
	    },
	    "mr":{
	        "name":"Marathi (Marāṭhī)",
	        "nativeName":"मराठी"
	    },
	    "mh":{
	        "name":"Marshallese",
	        "nativeName":"Kajin M̧ajeļ"
	    },
	    "mn":{
	        "name":"Mongolian",
	        "nativeName":"монгол"
	    },
	    "na":{
	        "name":"Nauru",
	        "nativeName":"Ekakairũ Naoero"
	    },
	    "nv":{
	        "name":"Navajo, Navaho",
	        "nativeName":"Diné bizaad, Dinékʼehǰí"
	    },
	    "nb":{
	        "name":"Norwegian Bokmål",
	        "nativeName":"Norsk bokmål"
	    },
	    "nd":{
	        "name":"North Ndebele",
	        "nativeName":"isiNdebele"
	    },
	    "ne":{
	        "name":"Nepali",
	        "nativeName":"नेपाली"
	    },
	    "ng":{
	        "name":"Ndonga",
	        "nativeName":"Owambo"
	    },
	    "nn":{
	        "name":"Norwegian Nynorsk",
	        "nativeName":"Norsk nynorsk"
	    },
	    "no":{
	        "name":"Norwegian",
	        "nativeName":"Norsk"
	    },
	    "ii":{
	        "name":"Nuosu",
	        "nativeName":"ꆈꌠ꒿ Nuosuhxop"
	    },
	    "nr":{
	        "name":"South Ndebele",
	        "nativeName":"isiNdebele"
	    },
	    "oc":{
	        "name":"Occitan",
	        "nativeName":"Occitan"
	    },
	    "oj":{
	        "name":"Ojibwe, Ojibwa",
	        "nativeName":"ᐊᓂᔑᓈᐯᒧᐎᓐ"
	    },
	    "cu":{
	        "name":"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",
	        "nativeName":"ѩзыкъ словѣньскъ"
	    },
	    "om":{
	        "name":"Oromo",
	        "nativeName":"Afaan Oromoo"
	    },
	    "or":{
	        "name":"Oriya",
	        "nativeName":"ଓଡ଼ିଆ"
	    },
	    "os":{
	        "name":"Ossetian, Ossetic",
	        "nativeName":"ирон æвзаг"
	    },
	    "pa":{
	        "name":"Panjabi, Punjabi",
	        "nativeName":"ਪੰਜਾਬੀ, پنجابی‎"
	    },
	    "pi":{
	        "name":"Pāli",
	        "nativeName":"पाऴि"
	    },
	    "fa":{
	        "name":"Persian",
	        "nativeName":"فارسی"
	    },
	    "pl":{
	        "name":"Polish",
	        "nativeName":"polski"
	    },
	    "ps":{
	        "name":"Pashto, Pushto",
	        "nativeName":"پښتو"
	    },
	    "pt":{
	        "name":"Portuguese",
	        "nativeName":"Português"
	    },
	    "qu":{
	        "name":"Quechua",
	        "nativeName":"Runa Simi, Kichwa"
	    },
	    "rm":{
	        "name":"Romansh",
	        "nativeName":"rumantsch grischun"
	    },
	    "rn":{
	        "name":"Kirundi",
	        "nativeName":"kiRundi"
	    },
	    "ro":{
	        "name":"Romanian, Moldavian, Moldovan",
	        "nativeName":"română"
	    },
	    "ru":{
	        "name":"Russian",
	        "nativeName":"русский язык"
	    },
	    "sa":{
	        "name":"Sanskrit (Saṁskṛta)",
	        "nativeName":"संस्कृतम्"
	    },
	    "sc":{
	        "name":"Sardinian",
	        "nativeName":"sardu"
	    },
	    "sd":{
	        "name":"Sindhi",
	        "nativeName":"सिन्धी, سنڌي، سندھی‎"
	    },
	    "se":{
	        "name":"Northern Sami",
	        "nativeName":"Davvisámegiella"
	    },
	    "sm":{
	        "name":"Samoan",
	        "nativeName":"gagana faa Samoa"
	    },
	    "sg":{
	        "name":"Sango",
	        "nativeName":"yângâ tî sängö"
	    },
	    "sr":{
	        "name":"Serbian",
	        "nativeName":"српски језик"
	    },
	    "gd":{
	        "name":"Scottish Gaelic; Gaelic",
	        "nativeName":"Gàidhlig"
	    },
	    "sn":{
	        "name":"Shona",
	        "nativeName":"chiShona"
	    },
	    "si":{
	        "name":"Sinhala, Sinhalese",
	        "nativeName":"සිංහල"
	    },
	    "sk":{
	        "name":"Slovak",
	        "nativeName":"slovenčina"
	    },
	    "sl":{
	        "name":"Slovene",
	        "nativeName":"slovenščina"
	    },
	    "so":{
	        "name":"Somali",
	        "nativeName":"Soomaaliga, af Soomaali"
	    },
	    "st":{
	        "name":"Southern Sotho",
	        "nativeName":"Sesotho"
	    },
	    "es":{
	        "name":"Spanish; Castilian",
	        "nativeName":"español, castellano"
	    },
	    "su":{
	        "name":"Sundanese",
	        "nativeName":"Basa Sunda"
	    },
	    "sw":{
	        "name":"Swahili",
	        "nativeName":"Kiswahili"
	    },
	    "ss":{
	        "name":"Swati",
	        "nativeName":"SiSwati"
	    },
	    "sv":{
	        "name":"Swedish",
	        "nativeName":"svenska"
	    },
	    "ta":{
	        "name":"Tamil",
	        "nativeName":"தமிழ்"
	    },
	    "te":{
	        "name":"Telugu",
	        "nativeName":"తెలుగు"
	    },
	    "tg":{
	        "name":"Tajik",
	        "nativeName":"тоҷикӣ, toğikī, تاجیکی‎"
	    },
	    "th":{
	        "name":"Thai",
	        "nativeName":"ไทย"
	    },
	    "ti":{
	        "name":"Tigrinya",
	        "nativeName":"ትግርኛ"
	    },
	    "bo":{
	        "name":"Tibetan Standard, Tibetan, Central",
	        "nativeName":"བོད་ཡིག"
	    },
	    "tk":{
	        "name":"Turkmen",
	        "nativeName":"Türkmen, Түркмен"
	    },
	    "tl":{
	        "name":"Tagalog",
	        "nativeName":"Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔"
	    },
	    "tn":{
	        "name":"Tswana",
	        "nativeName":"Setswana"
	    },
	    "to":{
	        "name":"Tonga (Tonga Islands)",
	        "nativeName":"faka Tonga"
	    },
	    "tr":{
	        "name":"Turkish",
	        "nativeName":"Türkçe"
	    },
	    "ts":{
	        "name":"Tsonga",
	        "nativeName":"Xitsonga"
	    },
	    "tt":{
	        "name":"Tatar",
	        "nativeName":"татарча, tatarça, تاتارچا‎"
	    },
	    "tw":{
	        "name":"Twi",
	        "nativeName":"Twi"
	    },
	    "ty":{
	        "name":"Tahitian",
	        "nativeName":"Reo Tahiti"
	    },
	    "ug":{
	        "name":"Uighur, Uyghur",
	        "nativeName":"Uyƣurqə, ئۇيغۇرچە‎"
	    },
	    "uk":{
	        "name":"Ukrainian",
	        "nativeName":"українська"
	    },
	    "ur":{
	        "name":"Urdu",
	        "nativeName":"اردو"
	    },
	    "uz":{
	        "name":"Uzbek",
	        "nativeName":"zbek, Ўзбек, أۇزبېك‎"
	    },
	    "ve":{
	        "name":"Venda",
	        "nativeName":"Tshivenḓa"
	    },
	    "vi":{
	        "name":"Vietnamese",
	        "nativeName":"Tiếng Việt"
	    },
	    "vo":{
	        "name":"Volapük",
	        "nativeName":"Volapük"
	    },
	    "wa":{
	        "name":"Walloon",
	        "nativeName":"Walon"
	    },
	    "cy":{
	        "name":"Welsh",
	        "nativeName":"Cymraeg"
	    },
	    "wo":{
	        "name":"Wolof",
	        "nativeName":"Wollof"
	    },
	    "fy":{
	        "name":"Western Frisian",
	        "nativeName":"Frysk"
	    },
	    "xh":{
	        "name":"Xhosa",
	        "nativeName":"isiXhosa"
	    },
	    "yi":{
	        "name":"Yiddish",
	        "nativeName":"ייִדיש"
	    },
	    "yo":{
	        "name":"Yoruba",
	        "nativeName":"Yorùbá"
	    },
	    "za":{
	        "name":"Zhuang, Chuang",
	        "nativeName":"Saɯ cueŋƅ, Saw cuengh"
	    }
	};



	var _defaultTag = internal.prefix() + "var";
	var _modname = "language";

	var instance = function( target , options , events ) {

		this.target = typeof target == 'string' ? $( target ) : target;
		this.cfg = this.defaultOptions();
		utils.applyProperties( this.cfg , options );
		this.events = {
			onLanguageSet: false,
			onVariableSet: false
		};
		utils.applyProperties( this.events , events );
		this.data = {};
		this.current = false;
		this.vars = {};
		this.getVars();

	}

	Object.assign( instance.prototype , {

		defaultOptions: function() {
			
			return {
				animation: true,
				animationType: "fadeIn",
				animationSpeed: "5000",
				cloneData: false,
				variableTag: _defaultTag
			};
		
		},

		setAnimation: function( v ) {
			this.cfg.animation = v == true ? true : false;
		},

		languageExists: function( name ) {

			if( this.data[name] == undefined ) { return false; }
			return true;

		},

		activeLanguageExists: function() {

			if( this.active == false || this.data[ this.active ] == undefined ) { return false; }
			return true;

		},

		addLanguage: function( name , data ) {

			if( this.languageExists(name) ) { return false; }

			this.data[name] = this.cfg.cloneData == true ? JSON.parse( JSON.stringify( data ) ) : data;
			return true;

		},

		addLanguages: function( data ) {

			for( var i in data ) {
				this.addLanguage( i , data[i] );
			}
		},

		removeLanguage: function( name , data ) {

			if( !this.languageExists(name) ) { return false; }

			delete this.data[name];

			if( this.active === name ) {
				this.active = false;

			}

			return true;

		},

		setLanguage: function( name ) {

			if( !this.languageExists(name) ) { return false; }
			if( this.active == name ) { return false; }
			// Set active language
			this.active = name;
			// Update screen
			this.setVars();

			var onSet = this.events["onLanguageSet"];
			if( onSet !== undefined && typeof onSet == "function" ) {
				onSet( name );
			}

		},

		getVars: function() {
			
			var tag = this.cfg.variableTag;
			var list = this.target.find( tag );
			// If the list is empty or the active language is out of bounds
			if( list.length <= 0 ) { return false; }

			this.vars = {}; 

			list.each( function( id ) {

				var el = $(list[id]);

				var txt = el.html();
				var name = el.attr("name").trim();

				this.vars[name] = el;

			}.bind(this) );

		},

		_propertyRecursive: function ( o , str , cur , lim ) {
  
			var res = o;
			for( var n = cur; n < lim; n++ ) {
			  
				if( res[ str[n] ] == undefined ) { return false; }
				res = res[ str[n] ];
			  

			}
			return res;
		  
		},

		setVars: function() {

			// Recursive
			 

			var n = Object.keys( this.vars ).length;
			if( n <= 0 || !this.activeLanguageExists() ) { return false; }

			var ld = this.data[ this.active ];
			var el,c,ref;
			for( var p in this.vars ) {

				el = this.vars[p];

				// Added support for multi-nested objects. E.g. "lang.level1.level2.property" is acceptable
				c = p.split(".");
				// But not only nested. Sometimes the first level is sufficient. Therefore we need to make that distinction
				ref = c.length <= 1 ? ld[ c[0] ] : this._propertyRecursive( ld , c , 0 , c.length );
				 
				// If this property is not defined in the language pack selected, skip this element
				if( ref == undefined || ref == false ) { continue; }
				
				var tempRef = ref;
				if( this.events["onVariableSet"] !== undefined && typeof this.events["onVariableSet"] == "function" ) {
					ref = this.events["onVariableSet"]( this.active , p , ref , el );
				}
				if( ref == undefined ) { ref = tempRef; }

				// Update property
				if( this.cfg.animation == true ) {
					el.hide().html( ref )[ this.cfg.animationType ]( this.cfg.animationSpeed );
				} else { 
					el.html(ref);
				}
			}

		},

		detectBrowserLanguage: function() {
 
			return navigator.language || navigator.userLanguage; 

		},

		setLanguageAutomatically: function() {

			var bl = this.detectBrowserLanguage();

			return this.setLanguageClosest( bl );

		},

		setLanguageClosest: function( bl ) {

			// If the browser's language exists in the loaded language packs, set it as the current language
			if( this.data[ bl ] !== undefined ) {

				this.setLanguage(bl);
				return true;

			} 
			// Otherwise attempt to find some close relatives
			else {
				 
				// First try to find a Latin or Native spelling of the full language name based on the ISO-639-1 code
				var found = isoLangs[bl];
				if( found !== undefined ) {

					// Check the latin spelling first
					var latin = this.languageExists( found.name );
					if( latin ) { this.setLanguage( found.name ); return true; }
					// Then check the native spelling(s). In some cases there is more than one spelling separated by comma.
					var nts = found.nativeName.split(",");
					for( var i = 0 ; i < nts.length; i++ ) { 
						var ntn = nts[i].trim();
						var native = this.languageExists( ntn );
						if( native ) { this.setLanguage( ntn ); return true; }
					}
				} 
				// Otherwise attempt to split the string and see if the first part of the language code can be found in the language packs (e.g. "en-US" can be shown if there is only "en" available)
				else {

					bl = bl.split("-");

					if( bl.length <= 0 || bl[0].length <= 0 ) { return false; }

					if( this.data[ bl[0] ] !== undefined ) {

						this.setLanguage(bl[0]);
						return true;

					}

				}
				 
			}

			return false;
			
		}

	} );

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 
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

 
(function( _core , utils , internal ) {

	//"use strict";
 	var _modname = "scheduler";

 	var constructTask = function( cfg ) {

 		cfg = cfg || {};

 		return {
 			task: cfg.task,
 			//arguments: (cfg.arguments == undefined || cfg.arguments == null) ? [] : cfg.arguments,
 			date: cfg.date,
 			frames: typeof cfg.frames == 'object' && !cfg.frames.length ? [cfg.frames] : cfg.frames,
 			//iterations: cfg.iterations <= 0 ? 1 : cfg.iterations,
 			intervals: cfg.intervals < 0 ? 1000 : cfg.intervals,
 			pending: true
 		};

 	}

	var instance = function( options , events ) {
 		
 		this.cfg = this.defaultSettings();
 		utils.applyProperties( this.cfg , options );

 		this.events = {
 			onSensorTick: false,
 			onTaskStart: false,
 			onTaskFinish: false,
 			onFrameStart: false,
 			onFrameFinish: false
 		};
 		utils.applyProperties( this.events , events );

		this.tasks = {};

		this.setupSensor();

	}

	Object.assign( instance.prototype , {

		defaultSettings: function() {

			return {
				tickInterval: 1000
			};

		},
 
		addTask: function( ref , cfg ) {
 			
 			if( this.taskExists(ref) ) { return false; }	
			var o = constructTask( cfg );
			if( !o ) { return false; }
			this.tasks[ ref ] = o;
			return true;

		},

		removeTask: function( ref ) {

			if( !this.taskExists(ref) ) { return false; }
			this.pause();	
			delete this.tasks[ref];
			this.resume();
			return true;

		},
  
		taskExists: function( ref ) {

			if( this.tasks[ref] == undefined || typeof this.tasks[ref] !== 'object' ) {
				return false;
			}
			return true;

		},

		clearSensor: function() {

			if( this.sensor !== undefined && this.sensor !== null ) {
				clearInterval( this.sensor );
			}
			this.sensor = null;

		},

		setupSensor: function() {

			this.clearSensor();

			var delay = this.cfg.tickInterval; 	// By default the sensor ticks once every 1000 milliseconds (i.e. 1 second)

			this.sensor = setInterval( function(){

				if( this.paused ) { return; }
				// Get the current date and time in milliseconds
				var cd = Date.now();

				if( typeof this.events["onSensorTick"] === 'function' ) {
					this.events["onSensorTick"]({ scheduler: this , taskCount: Object.keys(this.tasks).length });
				}

				var o, t, dt, f, ivs;
				for( var ref in this.tasks ) {

					o = this.tasks[ref];

					if( !o.pending ) { continue; }
					t = o.date;
					if( t instanceof Date ) {
						t = +t;	// Convert to milliseconds
					}
					if( t < 0 ) { t = 0; }
					dt = cd - t;
					// If the current time is equal to or surpasses the specified time to execute this task, execute all of its frames
					if( dt >= 0 ) {
						// Iterate through all defined frames for the task and execute them with the respective arguments for each frame
						for( var i = 0 ; i < o.frames.length; i++ ) {

							f = o.frames[i];
							ivs = o.intervals;
							
							// If intervals is <= 0 then the task will be executed immediately.
							// NOTE! It is necessary to bind these properties to the setTimeout callback, or else they won't get passed directly from the loop
							setTimeout( function(){
 
								// If this is the first frame, call the task start event
								if( this.id === 0 ) {
									if( typeof this.scheduler.events["onTaskStart"] === 'function' ) {
										this.scheduler.events["onTaskStart"]( this );
									}
								}

								if( typeof this.scheduler.events["onFrameStart"] === 'function' ) {
									this.scheduler.events["onFrameStart"]( this );
								}

								o.task.apply( { frameIndex: this.id , taskReference: this.taskReference } , this.frame.arguments );
							 	
								if( typeof this.scheduler.events["onFrameFinish"] === 'function' ) {
									this.scheduler.events["onFrameFinish"]( this );
								}

								// If this is the last frame, remove the task from the queue to avoid infinite loops.
								if( this.id === this.obj.frames.length-1 ) {
									// Call the task finish event
									if( typeof this.scheduler.events["onTaskFinish"] === 'function' ) {
										this.scheduler.events["onTaskFinish"]( this );
									}
									delete this.scheduler.tasks[ this.taskReference ];
								}

							}.bind({ scheduler: this , id: i , obj: o , frame: f , taskReference: ref }), ivs*i );
							 
						}
						// After the task execution service has been setup, set this task as NOT PENDING anymore. This will make the sensor ignore it while it executes fully.
						o.pending = false;

					}

				}

			}.bind(this) , delay );

		},

		pause: function() {
			this.paused = true;
		},

		resume: function() {
			this.paused = false;
		}

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );


 
/*
* This module allows the user to map an object to a spline and position it on a point along the spline. 
* The object's orientation can also be set to match the tangent of that point.
*/

(function( _core , utils , math , internal ) {

	var Vector2 = math.Vector2;
	var Curve = math.Curve;
	var SplineCurve = math.SplineCurve;

	//"use strict";
	var _modname = "spline";

	var instance = function( target , options ) {

		this.target = typeof target == 'string' ? $( target ) : target;
		this.cfg = this.defaultSettings();
		utils.applyProperties( this.cfg , options );

		if( this.cfg.points.length >= 2 ) {
			this.buildPath();
		}

		// Resizing sensor for all attached elements
		this.sensor = new utils.resizeSensor( this.target , function(){ 

			this.updateElements();

		}.bind(this) );

	}

	Object.assign( instance.prototype , {

		defaultSettings: function() {

			return {

				points: [],
				path: false,
				fluid: false,
				elements: {}

			};

		},

		buildPathHelpers: function( n ) {

			n = n || 20;

			var pts = [];
			for( var i = 0 ; i < n ; i++ ) {

				pts.push(
					this.calculatePoint( i/(n-1) )
				);

			}

			var div='';
			var w,d,a,c;
			for( var i = 0 ; i < n-1; i++ ) {

				d = pts[i+1].clone().sub( pts[i] );
				c = d.clone().divideScalar()
				w = Math.abs( d.length() );
				a = d.normalize().angle() * 57.2958;	// Convert from Radians to Degrees

				div += '<div class="helper-line" style="top:'+pts[i].y+'px;left:'+(pts[i].x-w/2)+'px;width:'+w+'px;transform:rotate('+a+'deg) translateX(50%);"></div>'; 
				

			}

			this.target.append( div );


		},

		calculatePoint: function( t ) {

			// curve time step must be between 0 and 1. 
			if( t < 0 || t > 1 || this.cfg.path == false ) { return false; }

			var p = this.cfg.path.getPointAt( t );

			if( this.cfg.fluid == true ) {

				var w = this.target.width();
				var h = this.target.height();

				p.x = w * (p.x/100);
				p.y = h * (p.y/100);

			} 

			return p;

		},

		addElement: function( cfg ) {

			cfg = cfg || {};

			var name = cfg.name;
			var el = typeof cfg.id == 'string' ? $( cfg.id ) : cfg.id;

			this.cfg.elements[name] = {
				el: el,
				position: cfg.position == undefined ? 0 : utils.clamp(cfg.position,0,1),
				follow: cfg.follow == true ? true : false,										// Element follows the tangent of the curve
				angleOffset: cfg.angleOffset == undefined ? 0 : cfg.angleOffset,		 		// Degrees of offset for the element
				centered: cfg.centered == true ? true : false
			};

		},

		removeElement: function( name ) {

			if( this.cfg.elements[name] == undefined ) { return false; }
			delete this.cfg.elements[name];

		},

		positionElement: function( name , position ) {

			var o = this.cfg.elements[name];
			if( o == undefined ) { return false; }
			
			var moving = false;
			if( position !== undefined ) {

				position = utils.clamp(position,0,1);
				if( o.position !== position ) { moving = true; }
				o.position = position;

			}  

			var pos = o.position;
			var p = this.calculatePoint( pos );
			  
			o.el.css({
				left: p.x+"px",
				top: p.y+"px"
			});

			if( o.follow == true ) { 

				var sign = pos < 1 ? 1 : -1;
				var near = this.calculatePoint( pos + 0.00001*sign );
				if( near == false ) { return false;  }
				var delta = near.clone().sub( p ).normalize();
				if( sign == -1 ) { delta = delta.negate(); }
				var a = delta.angle() * 57.2957795;
				var ao = o.angleOffset;

				this.rotateElement( name , a+ao );

			}

		},

		animateElement: function( name , targetPosition , time , events ) {

			var o = this.cfg.elements[name];
			if( o == undefined ) { return false; }

			events = events || {};

			var range = targetPosition - o.position;
			var fps = 120;
			var msPerFrame = 1000 / fps;
			var nExecs = time / msPerFrame;			// Number of times the loop will execute
			var posStep = range / nExecs;			// Position increment per execution of the update loop

			var e = 0;
			var i = setInterval( function() {

				if( e > nExecs ) { 
					// onFinish callback
					if( events.onFinish !== undefined && typeof events.onFinish == "function" ) {
						events.onFinish();
					}
					// Afterwards, end the animation loop
					clearInterval( i );
					return;
				} else if( e == 0 ) {
					// onStart callback
					if( events.onStart !== undefined && typeof events.onStart == "function" ) {
						events.onStart();
					}
				} else {
					// onUpdate callback
					if( events.onUpdate !== undefined && typeof events.onUpdate == "function" ) {
						events.onUpdate();
					}
				}

				this.moveElement( name , posStep );
 
				e++;

			}.bind(this) , msPerFrame );

		},

		rotateElement: function( name , angle ) {

			var o = this.cfg.elements[name];
			if( o == undefined ) { return false; }

			var ts = "";
			if( o.centered == true ) { ts += "translate(-50%,-50%) "; }
			ts += "rotate("+angle+"deg)";

			o.el.css({
				transform: ts
			});

		},

		moveElement: function( name , speed , loop ) {

			var o = this.cfg.elements[name];
			if( o == undefined ) { return false; }

			o.position = utils.clamp( o.position+speed , 0 , 1 );

			if( loop == true ) {
				if( o.position <= 0 && speed < 0 ) { o.position = 1; }
				else if( o.position >= 1 && speed > 0 ) { o.position = 0; }
			}
 
			return this.positionElement( name );


		},

		moveElements: function( speed , loop ) {

			var i = 0;
			var cs = speed;
			for( var e in this.cfg.elements ) {

				if( speed.length && speed.length > 0 ) {
					cs = speed[ i % speed.length ];
				}
				 
				this.moveElement( e , cs , loop );

				i++;

			}

		},

		updateElements: function() {

			for( var e in this.cfg.elements ) {
 
				this.positionElement( e );
  
			}

		},

		addPoint: function( x , y ) {

			this.cfg.points.push( new Vector2(x,y) );

		},

		setPoints: function( ar ) {

			this.cfg.points = ar;

		},

		removePoint: function( i ) {

			if( i < 0 || i >= this.cfg.points.length ) { return false; }
			this.cfg.points.splice( i , 1 );

		},

		buildPath: function() {

			if( this.cfg.points.length < 2 ) { return false; }
			this.cfg.path = new SplineCurve( this.cfg.points );

		}

	});

	
	internal.defineModule( _modname , instance );
	

})( Glacier , Glacier.utils , Glacier.math , Glacier.internal );

 
(function( _core , utils, internal ) {

	//"use strict";
	var _modname = "state";
 
	var instance = function( cfg ) {
 		
		cfg = cfg || {};

 		this.target = typeof cfg.target == 'string' ? $( cfg.target ) : cfg.target;
 		this.checkTargets();

 		this.cfg = this.defaultSettings();
 		utils.applyProperties( this.cfg , cfg.options );

 		this.value = null;
 		this.events = {
			onValueChange: false,
			onApply: false
		};
		utils.applyProperties( this.events , cfg.events );

	}

	Object.assign( instance.prototype , {

		checkTargets:function() {

			// Null should be accepted for variables which don't require a DOM injection
			if( this.target == null ) { return false; }
			// Otherwise, convert the target property to an array. This way the user can specify a single or multiple targets per class instance.
			if( !this.target.length ) { this.target = [this.target]; }
	 		else if( this.target.length && this.target.length > 0 ) {
	 			var ar = [];
	 			for( var i = 0 ; i < this.target.length; i++ ) {
	 				if( typeof this.target[i] == 'string' || typeof this.target[i] == 'object' ) { 
	 					ar.push( $( this.target[i] ) ); 
	 				}
	 			}
	 			this.target = ar;

	 		}

		},

		defaultSettings: function() {
			return {
				animation: false,		// Set to true if you wish the DOM change triggered by apply() to have a transition attached to it (e.g. fade)
				duration: 400,			// Duration of the animation sequence triggered by the DOM change from apply() in milliseconds
				injectAsText: false		// By default injection is as HTML. You may wish to only allow Text injection.
			};
		},
		// Get the current value of the variable.
		get: function() {

			return this.value;

		},
		// Set the current value of the variable. Will trigger a DOM change if needed (i.e. if there are defined targets).
		set: function(v) {

			if( this.value === v ) { return false; }
			var old = this.value;
			this.value = v;
			if( this.events !== undefined && typeof this.events["onValueChange"] === 'function' ) {
				this.events["onValueChange"]( old , v );
			}
			this.apply( true );
			return true;

		},
		// Apply the current value of the variable into any specified targets in the DOM
		apply: function( stringify ) {

			var t = this.target;
			// Not all state variables will need to be rendered in the DOM. In the constructor, such a variable is defined as NULL
			if( t == null ) { return false; }
			// If the target is not null, then it must be a non-empty array instead. If it isnt, return false;
			if( !t.length && t.length <= 0 ) { return false; }
			// Determine the JQuery DOM manipulation method for an element.
			var domCall = this.cfg.injectAsText == true ? "text" : "html";
			// If animation is set to true, use a JQuery transition.
			var anim = this.cfg.animation == true ? true : false;
			// A null value should be treated as an empty string.
			var val = this.value == null ? '' : this.value;
			// Sometimes you may wish to have a variable which is an object with properties. 
			// Injecting an object in DOM will show [Object] instead of its actual data. 
			if( stringify == true ) {
				if( typeof val === 'object' && !val.length ) { 
					//val = JSON.stringify( val , null , 2 );
				} 
			}
			// Apply the value of this variable(state) to the specified targets
			for( var i = 0 ; i < t.length; i++ ) {

				// If the value of this state is an array, apply the value of each array element to the respective target element.
				if( this.value.length ) {
					// If the array has less elements than defined targets, any target that doesn't have a corresponding element from the value array will be skipped
					if( this.value.length > i ) {
						val = this.value[i];
					} else {
						continue;
					}
				}

				if( anim == true ) { 
					t[ i ].hide()[ domCall ]( val ).fadeIn( this.cfg.duration );
				} else { 
					t[ i ][ domCall ]( val );
				}

				if( this.events !== undefined && typeof this.events["onApply"] === 'function' ) {
					this.events["onApply"]( i , t[i] , val );
				}

			}
			return true;


		} 

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 
(function( _core , utils , internal ) {

	//"use strict";

	var _defaultTag = internal.prefix() + "template";
	var _modname = "templating";

	var _regex = /\[\[([^\]\]]+)\]\]/gi;	// Global , Case-insensitive


	var instance = function() {
 
		this.templates = {};

	}

	Object.assign( instance.prototype , {

		templateExists: function( name ) {

			if( this.templates[name] == undefined ) { return false; }
			return true; 

		},

		loadTemplate: function( name , data , useAJAX ) {

			if( typeof data == "function" ) {

				this.templates[name] = {
					data: data()
				};
				this.templates[name].variables = this.templates[name].data.match(_regex);

			} else if( typeof data == "string" ) {

				if( useAJAX == true ) {

					function set(template) {

						// Create a JQuery object from the text data retrieved in this template file
						var $template = $(template);

						var sub = [];
						var block;
						// Go through the recognized element blocks and find the template declarations
						for( var i = 0 ; i < $template.length; i++ ) {
							block = $template[i];
							if( block.localName == _defaultTag ) {
								var attr = block.attributes["name"].nodeValue;
								var html = block.innerHTML;
								sub.push({
									name: attr,
									html: html
								});
							}
						}
 						// If there are no template declarations, then this is a single template file and the entire text data is the template.
						if( sub.length <= 0 ) {
							this.templates[name] = {
								data: template
							};
							this.templates[name].variables = template.match(_regex);
							return;
						} 
						// Otherwise there are template declarations, which means that there are multiple templates stored in this file. Read each of them and store it for later use.
						else {
							for( var i = 0 ; i < sub.length; i++ ) {
								this.templates[ sub[i].name ] = {
									data: sub[i].html
								};
								this.templates[ sub[i].name ].variables = sub[i].html.match(_regex);
							}
						}
  

					}

					$.ajax({
		                type : 'GET',
		                url : data,
		                dataType : 'text',
		                timeout : 5000,
		                success : set.bind(this),
		                error : function(error) {
		                    console.log("Template ["+cfg.data+"] could not be loaded.")
		                }
			        });

				} else {

					this.templates[name] = {
						data: data()
					};
					this.templates[name].variables = this.templates[name].data.match(_regex);

				}

			}

		},

		loadTemplates: function( data ) {

			if( !data.length ) { return false; }

			var t, name, ajax;
			for( var i = 0 ; i < data.length; i++ ) {

				t = data[i];
				name = t.name == undefined ? null : t.name;
				ajax = t.ajax == true ? true : false;
				this.loadTemplate( name , t.data , ajax );

			}

		},
 
		cloneTemplate: function( name , newName ) {

			if( !this.templateExists(name) || this.templateExists(newName) ) { return false; }
			this.templates[newName] = JSON.parse( JSON.stringify( this.templates[name] ) );
			return true;

		},
 

		inject: function( target , name , data , unwrap ) {

			// If this template doesn't exist, exit method and return false
			if( !this.templateExists(name) ) { return false; }
			// Get the template reference
			var template = this.templates[name].data;
			var variables = this.templates[name].variables;

			// If this is simply an empty template with text only (no variables), append HTML and exit method
			if( variables == null || variables.length <= 0 ) {
 
				var $result = $( $.parseHTML(template) ).appendTo(target);
				return $result;

			}
			 
			// After taking the template data and storing a copy of it, replace all template variables with the defined values in the template data object
			var wrapUUID = utils.uuid();
			var instance = '<'+_defaultTag+'-cluster uuid="'+wrapUUID+'">';
			instance += template.replace( _regex , this._iterator.bind({ data: data , name: name , target: target , templates: this.templates }) );
			instance += '</'+_defaultTag+'-cluster>';
			var $instance = $.parseHTML(instance);
			// Add the new template instance to the DOM
			var $result = $( $instance ).appendTo(target);
			 
			// Finally, check for any sub-template declarations. If such things exist, recursively render them using this injector
			var sub = target.find( _defaultTag+'-cluster[uuid="'+wrapUUID+'"] '+_defaultTag );
			// Iterate through all template declarations and find the number of instances to be rendered for each template type
			var unique = {};
			var current = {};

			sub.each(function(index){

				var t = $(sub[index]); 
				var name = t.attr("name").trim();
				if( !this.templateExists(name) ) { return; }
				// We need to keep track of how many iterations there are for each template name in order to assign the right data structure
				if( unique[name] == undefined ) { unique[name] = 1; } else { unique[name] += 1; }
				if( current[name] == undefined ) { current[name] = 0; }
 

			}.bind(this));
			// Iterate through all template declarations and attempt to instantiate them 
			sub.each( function(index) {
 
				var t = $(sub[index]);
				var name = t.attr("name").trim();
				var thisUUID = t.attr("uuid");
				// If this template doesn't exist, skip this iteration, Otherwise, instantiate the template
				if( !this.templateExists(name) ) { return; }
				 
				// If only one iteration exists 
				var tData;
				if( data[name] == undefined ) { tData = data; }
				else {
					if( unique[name] <= 1 ) { tData = data[name]; }
					else { tData = data[name][ current[name] ]; }
				}

				current[name] += 1;
				// Finally, inject the template (this creates a recursive cycle)
				this.inject( t , name , tData , true );

			}.bind(this));

			// Remove the temporary tags
			//target.find( _defaultTag ).contents().unwrap();
			//target.find( _defaultTag + "-cluster").contents().unwrap();
			 
			return $result;

		},
 
		_iterator: function(match, p1, p2, p3, offset, string){
			
			// p1 is nondigits, p2 digits, and p3 non-alphanumerics
 
			// Get rid of the variable tags for the current match
			var trimmed = match.substr( 2 , match.length-4 );
			// Get the first character of the trimmed variable reference 
			var fc = trimmed.substr(0,4);
			// If the first character is a ">", then this block is a reference to another template
			if( fc == "&gt;") {
				// Remove the sign and trim whitespace
				var name = trimmed.substr( 4 , trimmed.length-4 ).trim();
				// Check to see if this template exists (is loaded). If not, replace the declaration with an empty string
				if( this.templates[name] == undefined ) { return ""; }

				// A UUID is necessary to be able to distinguish each instance of the same template type
				var uuid = utils.uuid();
				var single = '<'+_defaultTag+' name="'+name+'" uuid="'+uuid+'"></'+_defaultTag+'>\n';

				var variables = this.templates[name].variables;	
				
				var ref = this.data[ name ];

				if( (ref == undefined || ref == false) && variables !== null ) { return ""; }
				else if( variables == null ) { return single; }

				if( typeof ref == "function") {
					ref = ref( name );
				}
				
				var res = '';
				if( ref.length && ref.length > 0 ) {
					for( var i = 0 ; i < ref.length; i++ ) {
						res += single;
					}
				} else {
					res = single;
				}

				// Otherwise create a template element. This is used by the injector to recursively inject sub-templates in the right places
				return res;
			}

			// Added support for multi-nested objects. E.g. "lang.level1.level2.property" is acceptable
			var c = trimmed.split(".");
			// But not only nested. Sometimes the first level is sufficient. Therefore we need to make that distinction
			var ref = c.length <= 1 ? this.data[ c[0] ] : utils.propertyRecursive( this.data , c , 0 , c.length );
 		
			// Allow for custom methods to be set as properties by calling the associated method and set its returned value(s) as this one
			if( typeof ref == "function") {
				var varName = c[ c.length-1 ]; // The name of the variable in terms of its relative position in the data object (i.e. the property name)
				ref = ref( varName );
			}

			// If no reference is found within the template data, 
			if( ref == undefined || ref == false ) { return ""; }

			return ref;

		} 

	} );

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );
 