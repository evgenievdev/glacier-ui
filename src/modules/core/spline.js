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

 