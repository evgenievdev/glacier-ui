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