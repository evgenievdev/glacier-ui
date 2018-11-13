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

 