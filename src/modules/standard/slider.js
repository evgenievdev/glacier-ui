(function( _core , utils , internal ) {

	//"use strict";
	var _modname = "slider";

	var instance = function( target , options ) {
		
		this.cfg = {
			
			type: 'horizontal', // horizontal , vertical , radial
			min: 0,
			max: 100,
			animation: 200,
			colors: [
				{ h: 0 , s: 50 , l: 50 },
				{ h: 150 , s: 50 , l: 50 }
			]
			
		}

		this.target = typeof target == 'string' ? $( target ) : target;
		
		this.progress = this.target.children('.progress');
		
		this.handle = this.progress.children('.handle');
		
		this.value = this.cfg.min;
		 
		var dragging = false;
		var	sx = 0 , sy = 0, cx = 0 , cy = 0, dx = 0 , dy = 0;
		var pw, hspx, hspy, rem, which_handle;
		
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
			
			var target = e.target;
			
			which_handle = $( target ).hasClass('min') == true ? 'min' : 'max';
		
			
			var left = parseInt( this.progress.css('left') , 10 );
			if( which_handle == 'max' ) {
				 
				hspx = parseInt( this.progress.css( 'width' ) , 10 ) + left;
				rem = pw - hspx + left;
				
			} else if( which_handle == 'min' ) {
			
				hspx = left;
				rem = pw;
			
			}
			 
			 
			 
		  
		}.bind( this ) );
		
		$( window ).on('mousemove touchmove', function( e ) {
			
			if( dragging === true ) {

				if( e.touches !== undefined ) {
			
					cx = e.touches[ 0 ].clientX;
					cy = e.touches[ 0 ].clientY;
					
					dx = cx - sx;
					dy = dy - sy;
				
				} else {
				
					cx = e.clientX;
					cy = e.clientY;
				
					dx = cx - sx;
					dy = cy - sy;
				
				}
				
				if( dx !== 0 && dx <= rem ) {
					
					var posx = hspx + dx;
					if( posx > pw ) { 
						posx = pw;
					} else if( posx < 0 ) {
						posx = 0;
					}
				
					var prop = posx / pw;
					var newval = ( this.cfg.max - this.cfg.min ) * prop + this.cfg.min;
				 
					this.set_value( newval , false , which_handle ); 
				 
				
				}
			 
			}
			
		}.bind( this ) );
		
		$( window ).on('mouseup touchend',function( e ) {
		 
			dragging = false;
		 
		}.bind( this ) );
		
		
		this.target.on('mousedown' , function( e ) {
			
			// Make sure the user is not clicking the handle
			if( !$( e.target ).closest( this.handle ).length ) {
			
				var offset = this.target.offset(); 

				var relX = e.pageX - offset.left;
				var relY = e.pageY - offset.top;
				
				var bw = this.target.width();
				
				var prop = relX / bw;
				 
				var newval = ( this.cfg.max - this.cfg.min ) * prop + this.cfg.min;
				 
				var which = relX < parseInt( this.progress.css('left') , 10 ) ? "min" : "max"
				 
				this.set_value( newval , true , which );
		
				
			}
		
		}.bind( this ) );
		
	};

	Object.assign( instance.prototype , {

		get_percent : function( v ) {

			return (v - this.cfg.min) / (this.cfg.max - this.cfg.min);

		},

		set_value : function( v , animate , which ) {
			
			if( v == undefined ) { return; }
			
			this.value = Math.min( Math.max( v , this.cfg.min ) , this.cfg.max );
			
			var percent = this.get_percent( v );
			
			var min_percent = parseInt( this.progress.css('left') , 10 ) / this.target.width();
			
			var anim;
			if( which == "min" ) {
			
				anim = {
					left: percent * 100 + "%",
					width: this.progress.width() + parseInt( this.progress.css('left') , 10 ) - this.target.width() * percent + "px"
				};
			
			} else if( which == "max" ) {
			
				anim = {
					width: (percent - min_percent) * 100 + "%"
				};
			
			}
			
			if( animate == true ) {
			
				this.progress.animate( anim , this.cfg.animation );
			
			} else {

				this.progress.css( anim );
				
			}
			
			if( this.cfg.colors !== undefined && this.cfg.colors.constructor === Array ) {
			 
				var col = this.cfg.colors;
				
				var h = percent * (col[ 1 ].h - col[ 0 ].h) + col[ 0 ].h;
				var s = percent * (col[ 1 ].s - col[ 0 ].s) + col[ 0 ].s;
				var l = percent * (col[ 1 ].l - col[ 0 ].l) + col[ 0 ].l;
				
				this.progress.css( "background" , "hsl( "+h+" , "+s+"% , "+l+"% )" );

			}

		}

	});

	internal.defineModule( _modname , instance );

})( Glacier, Glacier.utils , Glacier.internal );
 