(function( _core , utils , internal ) {

	//"use strict";

	var _modname = "tabs";
	var _defaultTag = internal.prefix() + "tabs";
	var _contentTag = "tab-content";

	var instance = function( target , options ) {
		 
		this.cfg = this.defaultSettings();

		this.active = null;
		this.target = null;
		this.data = {};
		
		this.setTarget( target );

	};

	Object.assign( instance.prototype , {

		defaultSettings: function() {
			return {
				linksElement: "li",
				contentTag: _contentTag,
				animation: true,
				duration: 500
			};
		},

		setLinks : function() {

			var liEl = this.cfg.linksElement;
			var cTag = this.cfg.contentTag;

			var links = this.target.find( '> .links '+liEl );
			if( links.length <= 0 ) { return; }
	 
			this.data = {};
			var activeTab = null;
			
			links.each( function( id ) {
				// Get the link element
				var li = $( links[ id ] );
				// Get the tab id attribute for this link
				var tabID = li.attr( cTag );
			 	// Find the tab content element based on the given ID
				var tab = this.target.find( cTag+'[id=' + tabID + ']' );
				if( tab.length <= 0 ) { return; }

				var isDisabled = li.hasClass('disabled');
				 
				//this.tabs.push( tab );
			 	this.data[ tabID ] = {
			 		link: li,
			 		content: tab,
			 		disabled: isDisabled ? true : false
			 	};
			 	// Add an onclick event to the link. Clicking the tab link will set this tab to active
				li.on( 'click' , function( e ) {
			  		
			  		if( this.data[ tabID ].disabled ) { return; }
					this.setActive( tabID );
				
				}.bind( this ) );
				// If this link has an active class attached, it is the default visible tab
				if( li.hasClass('active') ) {
					activeTab = tabID;
				}
			 
			}.bind( this ) );
			
			// If any tab link has an active class attached set it as the default tab upon initialization
			if( activeTab !== null ) {
					
				this.setActive( activeTab );
				
			}

		},

		setTarget : function( target ) {

			this.target = typeof target == 'string' ? $( target ) : target;
			
			this.setLinks();

		},

		tabExists: function( id ) {

			if( id == null || this.data[id] == undefined ) { return false; }
			return true;

		},

		setActive : function( id ) {

			if( !this.tabExists(id) ) { return false; }
			
			// Traverse all tabs and set content visibility
			for( var tab in this.data ) {
				 
				if( id == tab ) {
				
					this.data[ tab ].link.addClass('active');
					this.data[ tab ].content.show();
				
				} else {

					this.data[ tab ].link.removeClass('active');
					this.data[ tab ].content.hide();
				
				}
				
			}

			this.active = id;
			return true;

		},

		setDisabled: function(id) {

			if( !this.tabExists(id) ) { return false; }
			this.data[id].disabled = true;
			this.data[ tab ].link.addClass('disabled');
			return true;

		},

		getTabIndexes: function() {
			return Object.keys( this.data );
		},

		countTabs: function() {
			return this.getTabIndexes().length;
		}

	});

	internal.defineModule( _modname , instance , _modname , "."+_modname );

})( Glacier , Glacier.utils , Glacier.internal );
 