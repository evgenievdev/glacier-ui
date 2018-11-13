(function( _core , utils , internal ){

	//"use strict";
	var _modname = "modal";

	_core.processors[_modname] = function( tagPrefix , tag , cssClass ) {

		var $modals = $( tagPrefix + tag );
		var modals = new Array( $modals.length );
		
		var cur;
		$modals.each(function( index ) {
		
			cur = $(this);
			var width = cur.attr('width');
		 
			modals[ index ] = new instance( modal , {} );
		
		});
		
		return modals;

	}

	var instance = function( target , options ) {
			
		
		this.cfg = {
			onOpen: null,
			onClose: null,
			onAccept: null,
			onCancel: null
		}
		utils.applyProperties( this.cfg , options );
			
		this.modal = typeof target == "string" ? $( target ) : target;
	
		this.bClose = this.modal.find('.modal-close');
		this.bAccept = this.modal.find('.modal-accept');
		this.bCancel = this.modal.find('.modal-cancel');
		
		if( this.bAccept.length > 0 ) {
		
			this.bAccept.on('click' , function(){
			
				if( typeof this.cfg.onAccept == "function" ) {

					this.cfg.onAccept( this.modal );
				
				}
				
				this.close();
				
			}.bind(this));
		
		}
		
		if( this.bCancel.length > 0 ) {
		
			this.bCancel.on('click' , function(){
			
				
				if( typeof this.cfg.onCancel == "function" ) {

					this.cfg.onCancel( this.modal );
				
				}
				
				this.close();
				
			}.bind(this));
			
		}
		
		if( this.bClose.length > 0 ) {
		
			this.bClose.on('click' , function(){
			
				this.close();
				
			}.bind(this) );
		
		}
	
	};

	Object.assign( instance.prototype , {

	    close : function() {
		
			if( typeof this.cfg.onClose == "function" ) {

				this.cfg.onClose( this.modal );
			
			}				
			
			this.modal.fadeOut(  500 );
			
		},
		
		 open : function() {
			
			var state = this.modal.css('display');
			
			if( state == 'none' ) {
			
				if( typeof this.cfg.onOpen == "function" ) {

					this.cfg.onOpen( this.modal );
				
				}
				
				this.modal.fadeIn(  500 );
				
			}
			
		} 

	});
 
	internal.defineModule( _modname , instance , _modname , "."+_modname );

	 

})( Glacier , Glacier.utils , Glacier.internal );
 