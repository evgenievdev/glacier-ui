(function( _core , utils , internal ) {

	//"use strict";
	var _modname = "dropdown";
	var _modname2 = _modname + "Procedural";
	var _prefix = internal.prefix();

	var instance = function( target , options ) {
				
		// default settings
		this.cfg = {
			closeOnClick: true,
			animation: 300,
			collapse: false,
			events: null,
			onOpen: null,
			onClose: null
		};
		util.applyProperties( this.cfg , options );
	 
		this.menu = typeof target == 'string' ? $( target ) : target;
		
		this.content = this.menu.find('> .panel');
		this.content.hide();
		
		this.button = this.menu.find('> ['+_prefix+'data="toggle-dropdown"]');
		
		// sometimes you may wish to use different icons/text to specify the state of the dropdown. 
		//These are defined using the classes .open-only & .closed-only, which indicate when they will be visible
		this.open_only = this.button.find('> .open-only');
		this.closed_only = this.button.find('> .closed-only'); 
		
		// Since the dropdown is closed by default, hide the .open-only element and show the .closed-only one
		this.open_only.hide();
		this.closed_only.show();
		
		// get glacier's custom event ids
		var events = this.content.find('> ['+_prefix+'event-id]');			
		// traverse each link which has an event attached and connect it to its user defined method
		events.each( function( index ) {
			 
			var link = $( events[index] );
			
			var event_id = link.attr(_prefix+'event-id');
			
			if( event_id.length > 0 ) {
				
				// on click of the link, the custom event method defined by the user will be invoked
				link.on( 'click' , function( event_id ) {
				 
					if( this.cfg.events !== null && typeof this.cfg.events === 'object' && typeof this.cfg.events[ event_id ] === 'function' ) {
						
						// call custom method and bind this dropdown instance to the method's 'this' keyword. This gives access to the dropdown within the method
						this.cfg.events[ event_id ].bind( this )();
					
					}
				
				}.bind( this , event_id ) );
				
			}
		
		}.bind(this) );
		
		// toggle dropdown
		this.button.on( 'click' , function() {
		
			this.toggle();
		
		}.bind( this ) );
		
		// switch used to disable rapid clicking when using animations
		this.closed = true;

		// Allow the dropdown to be closed if the user clicks anywhere outside of it
		// Do NOT use stopPropagation() or return false on jQuery!!!
		$(document).on('click touchstart', function( e ) {
		 
			//alternatives: 
			// [glacier-data="toggle-dropdown"] - but when a link is pressed menu closes => no
			// a - if anything else is pressed such as empty margin between links, panel closes => no
			// .panel is the best choice
			if ( this.cfg.closeOnClick === true && !$( e.target ).closest( target+' .panel' ).length ) {
			
				this.close();
			
			}
		  
		}.bind(this) );
	 

	};

	Object.assign( instance.prototype , {

		 open : function( collapse ) {

			if( this.closed !== true ) { return; }
			
			function onComplete() {
			
				this.closed = false;
				
				this.button.addClass('active');
				
				this.open_only.show();
				this.closed_only.hide();
				
				if( typeof this.cfg.onOpen === 'function' ) {

					this.cfg.onOpen.bind( this )();
				
				}
			
			};
			
			if( this.cfg.collapse === true || collapse === true ) {
				
				this.content.show( 0 , onComplete.bind(this) );
				return;
				
			}
			
			this.content.slideDown( this.cfg.animation , onComplete.bind(this) );

		},

		 close : function( collapse ) {

			if( this.closed === true ) { return; }
			
			function onComplete() {
			
				this.closed = true;
				
				this.button.removeClass('active');
				
				this.open_only.hide();
				this.closed_only.show();
				
				if( typeof this.cfg.onClose === 'function' ) {

					this.cfg.onClose.bind( this )();
				
				}
			
			};
			
			if( this.cfg.collapse === true || collapse === true ) {
				
				this.content.hide( 0 , onComplete.bind(this) );
				return;
				
			}
			
			this.content.slideUp( this.cfg.animation , onComplete.bind(this) );

		},

		 toggle : function() {

			if( this.closed === true ) {
			
				return this.open();
				
			} else {
				
				return this.close();
				
			}

		} 


	});
 
	// -------------------------------------------- GENERATE DROPDOWN FROM JS ONLY ----------------------------------------------------


	var procedural = function( data , target ) {

		this.target = typeof target == 'string' ? $( target ) : target;;
		this.data = data;
		this.instances = [];

		var html = build( data , target );
		$( html ).appendTo( target );

		this.instantiate( data );

	};

	Object.assign( procedural.prototype, {

		instantiate : function( data ) {
		
			var d, id = data.id;
			for( var i = 0; i < data.links.length; i++ ) {
			
				d = data.links[ i ];
				
				if( i === 0 ) {
					this.instances.push( new instance( "#"+id ) );
				}
				
				if( d.sub !== null && typeof d.sub === 'object' ) {
				
					this.instantiate( d.sub );
				
				}
			
			}
		
		}

	});

 

	var build = function( data , target ) {
		
		var html = '<div class="dropdown '+data.direction+'" id="'+data.id+'">';
		
		html += menuBuilder( data , target , 0 );
		
		html += '</div>';
		
		return html;

	};


	var menuBuilder = function( data , target , nest ) {
		
		var html = '';
		
		var link, cl = false, aLink, toggle = false;
		for( var i = 0; i < data.links.length; i++ ) {

			link = data.links[ i ];
			 
			if( (i === 0 && nest > 0) || (i === 1 && nest === 0) ) {
				
				html += '<div class="panel '+data.alignment+' '+data.direction+'">'
				
				cl = true;
				
			} 
			
			if( i === 0 && nest === 0 ) {
				toggle = true;
			}
			
			aLink = buildLink( link , toggle );
			
			if( link.sub !== null && typeof link.sub === 'object' ) {
			
				aLink = '<div class="dropdown '+data.direction+'" id="'+link.sub.id+'">' + aLink + "";
				
				aLink += menuBuilder( link.sub , target , nest + 1 );
				
				aLink += '</div>';
				
			}
			
			html += aLink;
			 
			
			if( i === data.links.length - 1 && data.links.length > 1 && cl === true ) {
			
				html += '</div>';
				
				cl = false;
			
			}
			
		
		}
	 
		
		return html; 

	};

	var buildLink = function( link , toggle ) {

		var html = '';
		
		html += '<'+link.tag+' ';
		
		if( toggle === true ) {
		
			html += _prefix+'data="toggle-dropdown" ';
		
		}
			
		if( typeof link.event_id === 'string' && link.event_id.length > 0 && typeof link.event_id.callback === 'function' && i > 0 ) {
			
			html += _prefix+'event-id="'+ link.event_id +'" ';
			
		}
		
		if( typeof link.classes === 'string' && link.classes.length > 0 ) {
		
			html += 'class="'+link.classes+'"';
		
		}
		
		if( typeof link.custom_attr === 'string' ){
			html += link.custom_attr;
		}
		
		html += '>';
		
		html += link.inner;
		
		html += '</'+link.tag+'>'; 

		return html;

	};	

	internal.defineModule( _modname , instance , _modname , "."+_modname );
	internal.defineModule( _modname2 , procedural , _modname2 , "."+_modname );
 

})( Glacier , Glacier.utils , Glacier.internal );
 