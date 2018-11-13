(function( _core , utils , internal ) {

	//"use strict";
 	_modname = "navigation";

	var instance = function( target , options , events ) {
 		
 		this.target = typeof target == 'string' ? $( target ) : target;
 	 
 		this.cfg = this.defaultSettings();
 		utils.applyProperties( this.cfg , options );
 
 		this.events = {
			onOpenStart: false,
			onOpenDone: false,
			onCloseStart: false,
			onCloseDone: false
		};
		utils.applyProperties( this.events , events );

		this.isOpen = false;
		this.isAnimating = false;
		this.width = this.target.width();
		this.height = this.target.height();

		if( this.cfg.direction == "horizontal") {
			this.target.css("width","0px"); 
			this.target.hide();
		}

		if( this.cfg.open == true ) { 
			this.open();
		} else {
			this.close();
		}

		this.findCloseButton();
		this.findOverlay();

	}

	Object.assign( instance.prototype , {
 	
 		defaultSettings: function() {
 			return {
 				direction: "horizontal",
 				animation: true,
 				duration: 600,
 				open: false,
 				width: "320px",
 				minWidth: "0px",
 				height: "50px",
 				minHeight: "0px" 
 			};
 		},

 		findCloseButton: function() {

 			var b = this.target.find(".close-nav");
 			if(b.length<=0){ return false; }
 			this.closeButton = b;
 			b.click(function(){
 				this.close();
 			}.bind(this));

 		},

 		findOverlay: function() {
 		 
 			var el = this.target.find(".nav-overlay");
 			if( el.length <= 0 ) { return false; }
 			this.overlay = el;
 			el.click(function(){
 				this.close();
 			}.bind(this));

 		},
 

 		toggle: function() {
 
			if( this.isOpen ) {
				
				this.close();
				
			} else {
				
				this.open();
				
			}

 		},

 		close: function() {

 			if( this.isAnimating || !this.isOpen ) { return; }
 			var duration = this.cfg.animation == true ? this.cfg.duration : 0;

 			var dir = this.cfg.direction;
 			var props = dir == "horizontal" ? { width: this.cfg.minWidth } : { height: this.cfg.minHeight };

 			if( typeof this.events["onCloseStart"] === 'function' ) {
 				this.events["onCloseStart"]();
 			}

 			this.isAnimating = true;
 
			this.target.animate(
				props, 
				duration, 
				function(){ 

					this.isAnimating = false; 
					this.target.hide(); 

					if( typeof this.events["onCloseDone"] === 'function' ) {
		 				this.events["onCloseDone"]();
		 			}

				}.bind(this)
			);

			if( this.cfg.overlay && this.overlay !== undefined ) {
				this.overlay.fadeOut( duration );
			}
			this.isOpen = false;

 		},

 		open: function() {
 			
 			if( this.isAnimating || this.isOpen ) { return; }
 			var duration = this.cfg.animation == true ? this.cfg.duration : 0;

 			var dir = this.cfg.direction;
 			var props = dir == "horizontal" ? { width: this.cfg.width } : { height: this.cfg.height };
 			
 			if( typeof this.events["onOpenStart"] === 'function' ) {
 				this.events["onOpenStart"]();
 			}

 			this.isAnimating = true;
 			// Make the panel visible
			this.target.show();

			this.target.animate(
				props, 
				duration,
				function(){ 

					this.isAnimating = false; 

					if( typeof this.events["onOpenDone"] === 'function' ) {
		 				this.events["onOpenDone"]();
		 			}

				}.bind(this)
			);

			if( this.cfg.overlay && this.overlay !== undefined ) {
				this.overlay.fadeIn( duration );
			}
			this.isOpen = true;

 		}

	});

	internal.defineModule( _modname , instance );


})( Glacier , Glacier.utils , Glacier.internal );
 