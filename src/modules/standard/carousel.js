(function( _core , utils, internal ) {

	//"use strict";
	var _modname = "carousel";
	
	// Carousel Processor (used only by the compiler)
	_core.processors[_modname] = function( tagPrefix , tag , cssClass ) {
		
		var $carousels = $( tagPrefix + tag ); 
		var carousels = new Array( $carousels.length );
		
		var cur;
		$carousels.each(function( index ) {
		
			cur = $(this);
			var carousel = cur.find( cssClass );
			var options = {
				width : cur.attr('width'),
				height : cur.attr('height'),
				autoplay :cur.attr('auto-play') == 'true' ? true : false,
				interval : parseInt( cur.attr('interval') ),
				animation : parseInt( cur.attr('animation') ),
				revert : cur.attr('revert') == 'true' ? true : false,
				swipe : cur.attr('swipe') == 'true' ? true : false,
				swipemin : parseInt(cur.attr('swipe-minimum')),
				vertical : cur.attr('vertical') == 'true' ? true : false
			};
			 
			carousels[ index ] = new instance( carousel , options );
		
		});
		
		return carousels;
		
	};
	
	/**
	* Main method (instance)
	*/
	var instance = function( target , options ) {
	 
		// Default configuration
		this.cfg = {
			width: "100%",
			height: 300,
			autoplay: false,
			interval: 1000,
			animation: 500,
			revert: true,
			swipe: true,
			swipemin: 100,
			vertical: false
		};
		utils.applyProperties( this.cfg , options );
		 
 
		this.container = typeof target == "string" ? $( target ) : target;
		
		this.container.css( 'width' , this.cfg.width );
		this.container.css( 'height' , this.cfg.height );
		
		this.current = 0;
		this.items = this.container.find(".item");
	 
		this.links_container = this.container.find('.links');
		
		// Use this variable to avoid stacking animation calls if the user clicks the controls too quickly. When change() is called animating is set to true. When an animation is finished animating is returned to false;
		this.animating = false;
  
		// Fix item position bug when resizing display 
		// The regular .resize() event is not good enough 
		// because if overflow is detected and a scroll becomes visible/invisible,
		// it changes the width of the container if it is set to fluid,
		// but the resize event is already fired and thus does not recognize the marginal difference caused by the change in scroll visibility
		var sensor = new utils.resizeSensor( this.container , function(){ 
		
			var cWidth = this.container.width();
			var cHeight = this.container.height();
				
				if( this.cfg.vertical == true ) {
				
					this.items.css("left","0px");
					this.items.css("top" , "-"+cHeight*this.current+"px");
				
				} else {
				
					this.items.css("top","0px");
					this.items.css("left" , "-"+cWidth*this.current+"px");
				
				}
				
			}.bind(this));
			
			this.bPrev = this.container.find('.carousel-previous');
			this.bNext = this.container.find('.carousel-next');
			
			this.bPrev.on('click' , function(){
			
				this.previous();
				
			}.bind(this));
			
			this.bNext.on('click' , function(){
			
				this.next();
				
			}.bind(this));
			
			
		/**
		* Mobile responsiveness 
		*/
		 
		
		var dragging = false;
		var canslide = false;
		
		// Desktop only
		var	sx = 0 , sy = 0, cx = 0 , cy = 0, dx = 0 , dy = 0;
		// Mobile touch screens only
		var tsx = 0 , tsy = 0 , tcx = 0 , tcy = 0, tdx = 0 , tdy = 0;
		
		this.container.on('mousedown touchstart',function( e ) {
			
			if( this.cfg.swipe == true ) {
			
				dragging = true;
				
				sx = e.clientX;
				sy = e.clientY;
				
				if( e.touches !== undefined ) {
				
					tsx = e.touches[ 0 ].clientX;
					tsy = e.touches[ 0 ].clientY;
				
				}

				canslide = true;
		 
			}
			
		}.bind( this ) );
		
		$( window ).on('mousemove touchmove',function( e ) {
			
			if( dragging === true && this.cfg.swipe == true ) {
			 
				cx = e.clientX;
				cy = e.clientY;
				
				if( e.touches !== undefined ) {
			
					tcx = e.touches[ 0 ].clientX;
					tcy = e.touches[ 0 ].clientY;
					
					tdx = tcx - tsx;
					tdy = tdy - tsy;
				
				}
				
				dx = cx - sx;
				dy = cy - sy;
			 
			}
			
		}.bind( this ) );
		
		$( window ).on('mouseup touchend',function( e ) {
			
			var mindist = this.cfg.swipemin;
			var axis = this.cfg.vertical == true ? "y" : "x";
			
			if( this.cfg.swipe == true ) {
			
				if( ( ( (dx >= mindist || tdx >= mindist) && axis == "x" ) || ( (dy >= mindist || tdy >= mindist) && axis == "y" ) ) && canslide === true ) {
					
					//console.log('slide right');
					canslide = false;
					
					this.previous();
					
				}
				if( ( ( (dx <= -mindist || tdx <= -mindist) && axis == "x" ) || ( (dy <= -mindist || tdy <= -mindist) && axis == "y" ) ) && canslide === true ) {
				
					//console.log('slide left');
					canslide = false;
					
					this.next();
				
				}
				
				dragging = false;
			
			}
			 
		}.bind( this ) );
	 
		this.links = null;
		this._generateLinks();
		
		// Auto-play detector (consider re-writing)
		this.autochange = setInterval( function() {
		
			if( this.cfg.autoplay == true ) { 
			
				this.next();
				
			}
		
		}.bind( this ) , this.cfg.interval );
	
	};

	Object.assign( instance.prototype , {

		_itemsPerPage : function( vertical ) {
	 
			var iw = vertical == true ? this.items.height() : this.items.width();
			var cw = vertical == true ? this.container.height() : this.container.width();
	 
			return cw  / iw;
	 
		},
		
		_numPages : function( vertical ) {
		 
			var ipp = this._itemsPerPage( vertical );
			
			return Math.ceil( this.items.length / ipp );
	 
		},
		
		 _generateLinks : function() {
			
			var changeItem = function( index ) {
			
				this.change( index );
				
			};
			
			
			if( this.links !== null && this.links.constructor === Array && this.links.length > 0 ) {
			
				// empty element's contents
				this.links_container.empty();
				
				// remove all attached events
				for( var i = 0; i < this.links.length; i++ ) {
				
					this.links[ i ].removeEventListener( 'click' , changeItem );
					
				}
			
			}
			
			var pnum = this._numPages( this.cfg.vertical );
			
			this.links = [];
			this.links.length = pnum;
			 
			for( var i = 0; i < pnum; i++ ) {
			
				this.links[ i ] = document.createElement('li');
				 
				this.links[ i ].onclick = changeItem.bind( this , i );
			
				var l = $( this.links[ i ] ).appendTo( this.links_container );
				 
			}
			
			this.links[ this.current ].className = "active";
		
		},
		
		 change : function( id ) {
			 
			var pnum = this._numPages( this.cfg.vertical );
			
			// If the id is out of bounds or an animation is currently happening (transition), exit function
			if( id === this.current || id < 0 || id >= pnum || this.animating === true ) {
				
				return -1;
				
			}
			
			// Get the width in pixels of the container
			var cWidth = this.container.width();
			var cHeight = this.container.height();
	 
			// last element id
			var ipp = this._itemsPerPage( this.cfg.vertical );
			var lid = ipp * ( id + 1 );
			
			// how many element we need to compensate for
			var rem = 0;
			
			if( lid > this.items.length ) {
			
				rem = lid - this.items.length;
			
			}
			
			var xRevert = rem * this.items.width();
			var yRevert = rem * this.items.height();
			
			this.animating = true;
			
			if( this.cfg.vertical == true ) {
			
				this.items.css("left","0px");
				this.items.animate(
					{
					
						top: -cHeight * id + yRevert + "px"
						
					}, 
					this.cfg.animation, 
					function() {
						
						this.animating = false;
				
					}.bind(this)
				);
			
			} else {
			
				this.items.css("top","0px");
				this.items.animate(
					{
					
						left: -cWidth * id  + xRevert + "px"
						
					}, 
					this.cfg.animation, 
					function() {
						
						this.animating = false;
				
					}.bind(this)
				);
			
			}
			
			for( var i = 0 ; i < this.links.length; i++ ) {
				
				if( id !== i ) {
					this.links[ i ].className = "";
				} else {
					this.links[ i ].className = "active";
				}
				
			}
			 
			this.current = id;
			
		},
		
		 next : function() {
			
			var pnum = this._numPages( this.cfg.vertical );
			
			// Revert to first element (if allowed in cfg)
			if( this.current + 1 >= pnum && this.cfg.revert == true ) {
			
				this.change( 0 );
			
			} else {
				
				this.change( this.current + 1 );
				
			}
			
		},
		
		 previous : function() {
			 
			var pnum = this._numPages( this.cfg.vertical );
			 
			// Revert to last element (if allowed in cfg)
			if( this.current - 1 < 0  && this.cfg.revert == true ) {
			
				this.change( pnum - 1 );
			
			} else {
				
				this.change( this.current - 1 );
				
			}
			
		},
		
		 first : function() {
			
			this.change( 0 );
			
		},
		
		 last : function() {
			
			var pnum = this._numPages( this.cfg.vertical );
			
			this.change( pnum - 1 );
		
		},
		
		 show_buttons : function() {
		
			this.bPrev.show();
			this.bNext.show();
		
		},
		
		 hide_buttons : function() {
		
			this.bPrev.hide();
			this.bNext.hide();
		
		},
		
		 show_links : function() {
		
			this.links_container.show();
		
		},
		
		 hide_links : function() {
		
			this.links_container.hide();
		
		},
		
		 set_vertical : function() {
		 
			this.container.addClass('vertical');
			this.cfg.vertical = true;
			this._generateLinks();
			this.first();
	 
		},
		
		 set_horizontal : function() {
	 
			this.container.removeClass('vertical');
			this.cfg.vertical = false;
			this._generateLinks();
			this.first();
			
		},
		
		 swipable : function( val , min_distance ) {
		 
			this.cfg.swipe = val == true ? true : false; 
			
			this.swipe_min_distance( min_distance );
		
		},
		
		 swipe_min_distance : function( v ) {
		 
			if( v > 0 ) {
				
				this.cfg.swipemin = v;
				
			}
		
		},
		
		 play : function() {
		 
			this.cfg.autoplay = true;
		
		},
		
		pause : function() {
		 
			this.cfg.autoplay = false;
		
		}

	});

	internal.defineModule( _modname , instance , _modname , "."+_modname );
	
	
})( Glacier , Glacier.utils, Glacier.internal );
 