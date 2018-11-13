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