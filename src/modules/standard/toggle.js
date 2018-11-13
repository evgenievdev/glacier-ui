(function( _core , utils, internal ) {
	
	//"use strict"; 
	var _modname = "toggle";

	var instance = function( target , data , cfg ) {
		
		this.cfg = this.defaultSettings();
		utils.applyProperties( this.cfg , cfg );
		
		this.target = typeof target == 'string' ? $( target ) : target;
		
		this.data = data;
		
		this.current = 0;
		this.change( 0 );
		
		this.target.on( 'click' , function() {
			
			if( ( this.current < this.data.length - 1 && this.cfg.wrap == true ) || this.cfg.wrap == false ) {
			
				this.change( this.current + 1 );
				
			} else {
			
				this.change( 0 );
				
			}
		
		}.bind( this ) );
		
		this.target.on( 'contextmenu' , function( e ) {
		
			e.preventDefault();
			
			if( ( this.current > 0 && this.cfg.wrap == true ) || this.cfg.wrap == false ) {
			
				this.change( this.current - 1 );
				
			} else {
			
				this.change( this.data.length - 1 );
				
			}
		
		}.bind( this ) );
	
	};

	Object.assign( instance.prototype , {

		defaultSettings : function() {

			return {
				wrap: true
			};

		},
		
		change : function( id ) {
		
			if( id < 0 || id >= this.data.length ) { return false; }
			
			var d = this.data[ id ];
		
			this.target.html( d.content );
			
			if( typeof d.event === 'function' ) {
			
				d.event.bind( this )();
			
			}
			
			this.current = id;
		
		}

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 