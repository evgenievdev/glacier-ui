(function( _core , utils , internal ) {

	//"use strict";
	var _modname = "slider";

	var instance = function( target , options ) {
		
		options = options || {};
		this.target = typeof target == 'string' ? $( target ) : target;
		// Look for the vertical class on this progress bar instance and adjust accordingly. Boolean.
		this.vertical = this.target.hasClass("vertical") ? true : false;

		this.cfg = this.defaultSettings();
		this.events = {
			onValueSet: false
		};
		utils.applyProperties( this.events , options.events );
		utils.applyProperties( this.cfg , options );
 		
		this.progress = this.target.children('.progress');
		this.handle = this.progress.children('.handle');
		this.values = [ this.cfg.max , this.cfg.min ];

		if( typeof this.cfg.value == 'number' ) {
			this.setVal( this.cfg.value , false );
		} else if( typeof this.cfg.value == 'object' && this.cfg.value.length >= 2 ) {
			this.setVal( this.cfg.value[0] , false , "max" );
			this.setVal( this.cfg.value[1] , false , "min" );
		}
		 
		this.setupEvents();
		 
		
	};

	Object.assign( instance.prototype , {

		defaultSettings: function(){
			return {
				type: 'horizontal', // horizontal , vertical , radial
				min: 0,
				max: 100,
				interval: 0,
				value: 0,
				animation: 200,
				colors: [
					{ h: 0 , s: 50 , l: 50 },
					{ h: 150 , s: 50 , l: 50 }
				] 
			}
		},

		setupEvents: function() {

			var dragging = false;
			var	sx = 0 , sy = 0, cx = 0 , cy = 0, dx = 0 , dy = 0;
			var pw, ph, hspx, hspy, rem, which_handle;
			
			this.handle.on('mousedown touchstart', function( e ) {
				 
				dragging = true;

				if( e.touches !== undefined ) {
					sx = e.touches[ 0 ].clientX;
					sy = e.touches[ 0 ].clientY;
				} else {
					sx = e.clientX;
					sy = e.clientY;
				}
				
				pw = this.target.width();
				ph = this.target.height();

				var target = e.target;
				which_handle = $( target ).hasClass('min') == true ? 'min' : 'max';
				var vert = this.vertical;
				var left = parseFloat( this.progress.css('left') );
				var bottom = parseFloat( this.progress.css('bottom') );
				if( which_handle == 'max' ) {
					 
					hspx = parseFloat( this.progress.css( 'width' ) ) + left;
					hspy = parseFloat( this.progress.css( 'height' ) ) + bottom;
					rem = vert ? (ph - hspy + bottom) : (pw - hspx + left);
					 

				} else if( which_handle == 'min' ) {
				
					hspx = left;
					hspy = bottom;
					rem = vert ? ph : pw;
				
				}
				 
			  
			}.bind( this ) );
			
			$( window ).on('mousemove touchmove', function( e ) {
				
				if( !dragging  ) { return; }

				if( e.touches !== undefined ) {
					cx = e.touches[ 0 ].clientX;
					cy = e.touches[ 0 ].clientY;
				} else {	
					cx = e.clientX;
					cy = e.clientY;				
				}
				dx = cx - sx;
				dy = cy - sy;
				var vert = this.vertical;

				if( dx !== 0 && dx <= rem ) {
					
					var posx = utils.clamp( hspx + dx , 0 , pw );
					var posy = utils.clamp( hspy - dy , 0 , ph );
				 
					var prop = vert ? posy/ph : posx/pw;
					var newval = ( this.cfg.max - this.cfg.min ) * prop + this.cfg.min;
				 		 
					this.setVal( newval , false , which_handle ); 
				 
				
				}
				  
				
			}.bind( this ) );
			
			$( window ).on('mouseup touchend',function( e ) {
			 
				dragging = false;
			 
			}.bind( this ) );
			
			
			this.target.on('mousedown touchstart' , function( e ) {
				
				// Make sure the user is not clicking the handle
				if( !$( e.target ).closest( this.handle ).length ) {
				
					var offset = this.target.offset(); 

					var relX = e.pageX - offset.left;
					var relY = e.pageY - offset.top;
					var vert = this.vertical;
					var bw = this.target.width();
					var bh = this.target.height();
					var prop = vert ? 1-relY/bh : relX/bw; 
					var newval = ( this.cfg.max - this.cfg.min ) * prop + this.cfg.min;
			 		 
					var which;
					if( vert ) {
						which = bh-relY < parseFloat( this.progress.css('bottom') ) ? "min" : "max";
					} else {
						which = relX < parseFloat( this.progress.css('left') ) ? "min" : "max";
					} 
		 
					this.setVal( newval , true , which );
			
					
				}
			
			}.bind( this ) );

		},

		getPercent : function( v ) {

			return (v - this.cfg.min) / (this.cfg.max - this.cfg.min);

		},

		getVal: function() {

			if( this.handle.length === 1 ) { return this.values[0]; }
			return this.values;

		},

		setVal : function( v , animate , which ) {
			
			if( v == undefined ) { return; }
			if( which == undefined ) { which = "max"; }
			
			var vert = this.vertical;
			var id = which == "max" ? 0 : 1;
			var newval = utils.clamp( v, this.cfg.min, this.cfg.max );
			var oldval = this.values[id];
			this.values[id] = newval;
			
			var tw = this.target.width();
			var th = this.target.height();
			var pw = this.progress.width();
			var ph = this.progress.height();
			var left = parseFloat( this.progress.css("left") );
			var bottom = parseFloat( this.progress.css("bottom") ); 

			var percent = this.getPercent( v );
			var min_percent = vert ? bottom/th : left/tw;
			
			var anim;
			if( which == "min" ) {
				
				if( vert ) {
					anim = {
						bottom: percent * 100 + "%",
						height: ph + bottom - th * percent + "px"
					};
				} else {
					anim = {
						left: percent * 100 + "%",
						width: pw + left - tw * percent + "px"
					};
				}
			
			} else if( which == "max" ) {
				
				var prop = vert ? "height" : "width";
				anim = {};
				anim[prop] = (percent - min_percent) * 100 + "%";
	 
			}
			
			if( animate == true ) {
				this.progress.animate( anim , this.cfg.animation );
			} else {
				this.progress.css( anim );
			}
			
			if( this.cfg.colors !== undefined && this.cfg.colors.constructor === Array ) {
			 
				var col = this.cfg.colors;
				
				var cp = this.handle.length >= 2 ? this.getPercent( this.values[0] ) - this.getPercent( this.values[1] ) : percent;
				var h = cp * (col[ 1 ].h - col[ 0 ].h) + col[ 0 ].h;
				var s = cp * (col[ 1 ].s - col[ 0 ].s) + col[ 0 ].s;
				var l = cp * (col[ 1 ].l - col[ 0 ].l) + col[ 0 ].l;
				
				this.progress.css( "background" , "hsl( "+h+" , "+s+"% , "+l+"% )" );

			}

			if( typeof this.events["onValueSet"] === 'function') {
				var ev = {
					$target: this.target , 
					$progress: this.progress , 
					$handle: this.handle[id] , 
					handleType: which , 
					oldVal: oldval , 
					newVal: newval , 
					min: this.cfg.min , 
					max: this.cfg.max
				};
				this.events["onValueSet"]( ev );
			}

		}

	});

	internal.defineModule( _modname , instance );

})( Glacier, Glacier.utils , Glacier.internal );
 