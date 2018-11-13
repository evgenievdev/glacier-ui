(function( _core , utils , internal ) {
	
	//"use strict";
	var _modname = "context";
	var _prefix = internal.prefix();

	_core.processors[_modname] = function( tagPrefix , tag , cssClass ) {
	
		var $contexts = $( tagPrefix + tag );
		var contexts = new Array( $contexts.length );
		
		var cur;
		$contexts.each(function( index ) {
		
			cur = $(this);
			var carousel = cur.find( cssClass );
			
			var target = cur.attr('target');
			var eventsStr = cur.attr('events');
			
			// Remove tabs, enter, white-space, etc.
			eventsStr = eventsStr.replace(/(\r\n|\n|\r|\s)/gm,"");
			
			var events = null;
			if( typeof eventsStr == 'string' && eventsStr.length > 0 ) {

				var eventsArray = eventsStr.split(',');
				if( eventsArray.length > 0 ) {
						
					events = {};
					
					var e , name , callback;
					for( var i = 0 ; i < eventsArray.length; i++ ) {
					
						e = eventsArray[ i ].split('=');
						name = e[ 0 ];
						callback = e[ 1 ];
						
						events[ name ] = callback;
						
					}
					
				}
				 
			
			}			
			 
			contexts[ index ] = new instance( cur.find( cssClass ) , target , {
			
				events: events
				
			});
		
		});
		
		return contexts;
	
	};
	
	var instance = function( menu , target , options ) {
		
		/**
		* Allow the user to specify if they want to close the menu when clicking outside of target element
		*/
		 
		this.menu = typeof target == "string" ? $( menu ) : menu;
		this.target = typeof target == "string" ? $( target ) : target;
 
		this.target.on( "contextmenu" , function( e ) {

			e.preventDefault();

			var mx = e.clientX;
			var my = e.clientY;
			 
			this.show( mx , my );

		}.bind( this ) );

		this.target.on( "click" , function( e ) {

			var x = this.menu.css( "left" );
			var y = this.menu.css( "top" );

			var w = this.menu.width();
			var h = this.menu.height();
	 
			var mx = e.clientX;
			var my = e.clientY;

			// If the mouse coordinates are within the context menu, exit this function prematurely, before the hide function can be executed
			if( mx >= x && mx <= x + w && my >= y && my <= y + h ) { 

				return false;

			}

			this.hide();

		}.bind( this ) );
		
		/**
		* Disable the default context menu while the cursor is over the custom context menu, since it is a separate element from the target
		*/
		this.menu.on( "contextmenu" , function( e ) {
			
			e.preventDefault();
			
		});
		
		var events = this.menu.find(".links li["+_prefix+"event-id]");
  
		/**
		* Apply events and execute user defined callback functions for each respective link
		*/
		if( utils.isObject( options ) === true ) {
			
			if( utils.hasProperty( options , "events" ) && utils.isObject( options.events ) ) {
				
				events.each(function( index ) {
					 
					var e = $(this);
					
					var ref = e.attr(_prefix+"event-id");
					  
					if( utils.hasProperty( options.events , ref ) ) {
						
						e.on("click" , function( callback ){

							// The callback should normally be passed as a function
							if( utils.isFunction( callback ) ) {
							
								callback();
								
							} else if( typeof options.events[ ref ] == "string" ) {
							 
								// You may however also pass the function parameter as a string (this is used by default in the case of the compiler)
								utils.getFunctionContext( callback , window );
							
							}
						
						}.bind( ref , options.events[ ref ] ) );
					
					}
					
				});
			
			}
			
		}
		
	
	};

	Object.assign( instance.prototype , {

		 show : function( x , y ) {
		
			var mw = this.menu.width();
			var mh = this.menu.height();
			
			var tw = this.target.width();
			var th = this.target.height();
			
			var scrollX = this.target.scrollLeft();
			var scrollY = this.target.scrollTop();
			 
			var xOffset = 0 , yOffset = 0;
			
			if( x + mw > tw ) {
				xOffset = -mw;
			} 
			
			if( y + mh > th ) {
				yOffset = -mh;
			}
			
			var xArtifact = "left";
			var yArtifact = "top";
		
			this.menu.css( xArtifact , x + xOffset + scrollX + "px");
			this.menu.css( yArtifact , y + yOffset + scrollY + "px");

			$( this.menu ).hide();
			$( this.menu ).fadeIn( 200 );
		 

		},

		 hide : function() {
	 

			$( this.menu ).fadeOut( 200 );

		} 

	});
 	
 	internal.defineModule( _modname , instance , _modname , "."+_modname );
	 

})( Glacier , Glacier.utils , Glacier.internal );
 