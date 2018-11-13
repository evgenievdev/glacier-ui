(function( _core , utils , internal ){

	//"use strict";
	var _modname = "pagination";

	//tinyPagination port to Glacier
	var instance = function( target , controls , options , events ) {
		 
		this.target = typeof target == 'string' ? $( target ) : target;
		this.controls = typeof controls == 'string' ? $( controls ) : controls;
		
		this.cfg = this.defaultSettings();
		utils.applyProperties( this.cfg , options );

		this.events = {
			onPageChange: false
		};
		utils.applyProperties( this.events , events );

		this.items = [];
		this.links = [];

		this.currentPage = 0;
		this.maxPages = 0;

		this.getItems();
		this.createLinks();
		this.setPage(1);
		 
		
	};

	Object.assign( instance.prototype , {

		defaultSettings: function() {
			return {
				itemContainer: ".item",
				itemsPerPage: 5,
				prevLabel: "< prev",
				nextLabel: "next >",
				hidePrev: false,
				hideNext: false,
				maxLinks: 0,
				showRange: false
			};
		},

		getItems: function() {

			var itemContainer = this.cfg.itemContainer;
			var list = this.target.find( itemContainer );

			if( list.length <= 0 ) { return false; }

			this.items = [];
			list.each( function(id) {

				var item = $(list[id]);
				this.items.push( item );

			}.bind(this));

		},

		countPages: function() {

			var ipp = this.cfg.itemsPerPage;
			var ni = this.items.length;

			var pc = Math.ceil( ni / ipp );
			return pc;

		},

		setPage: function( n ) {
 
			this.maxPages = this.countPages();
			if( n < 1 || n > this.maxPages ) { return false; }

			this.currentPage = n;
			this.updateItems();

			// Set the visibility of certain links, based on the user's configuration
			this.setLinksVisibility();
			// Update link classes
			this.setLinksClasses();

			if( typeof this.events["onPageChange"] === 'function' ) {
				this.events["onPageChange"]( n , this.links[ n ] );
			}

		},

		previous: function() {
			return this.setPage( this.currentPage - 1 );
		},

		next: function() {
			return this.setPage( this.currentPage + 1 );
		},

		first: function() {
			return this.setPage( 1 );
		},

		last: function() {
			return this.setPage( this.maxPages );
		},
 
		updateItems: function() {

			var cp = this.currentPage;
			var mp = this.maxPages;
			if( cp < 1 || cp > mp ) { return false; }

			var ipp = this.cfg.itemsPerPage;
			var si = (cp-1)*ipp;				// Start index for the visible pages
			var ei = si + ipp;					// Last index for the visible pages

			var el;
			for( var i = 0 ; i < this.items.length; i++ ) {

				el = this.items[i];

				if( i < si || i >= ei ) {
					el.hide();
				} else {
					el.show();
				}

			} 

		},

		getNewPage: function( n ) {

			var page = 1;
			page = ( this.current - 1 ) * this.cfg.itemsPerPage + 1;
			if( page <= 0 ) { return 1; }
			page = Math.ceil( page / n );
			return page;

		},

		setItemsPerPage: function( n ) {

			if( n < 1 ) { return false; }

			var new_page = this.getNewPage( n );
			this.cfg.itemsPerPage = n;
			this.createLinks();
			this.setPage( new_page );

		},

		createLink: function( label , pageNum ) {

			var $li = $('<li>'+label+'</li>');

			$li.on( "click" , function(e) {

				if( pageNum == "prev" ) { this.previous(); }
				else if( pageNum == "next" ) { this.next(); }
				else { 
					this.setPage( pageNum );
				}

			}.bind(this) );

			this.links.push( $li );

			this.controls.append( $li );

		},

		createLinks: function() {

			// If there are any existing links, remove them first
			this.removeLinks();

			// Create 'previous' button. Use custom label for button if defined, otherwise use a default value
			var prev_label = this.cfg.prevLabel !== undefined ? this.cfg.prevLabel : '< prev';
			this.createLink( prev_label , "prev" );

			var label = 1, label_a, label_b, ppg = this.cfg.itemsPerPage;

			// number of pages
			var nump = this.countPages(), li;

			for( var link_id = 1; link_id <= nump; link_id++ ) {

				label = this.makeLinkLabel( link_id );
				this.createLink( label , link_id );

			}

			// Create 'next' button. Use custom label for button if defined, otherwise use a default value
			var next_label = this.cfg.nextLabel !== undefined ? this.cfg.nextLabel : 'next >';
			this.createLink( next_label , "next" );

			// Set the visibility of certain links, based on the user's configuration
			this.setLinksVisibility();


		},
		// TODO
		makeLinkLabel: function( id ) {

			return id;

		},

		hideLinks: function() {
			for( var i = 0 ; i < this.links.length; i++ ) {
				this.links[i].hide();
			}
		},

		showLinks: function() {
			for( var i = 0 ; i < this.links.length; i++ ) {
				this.links[i].show();
			}
		},

		setLinksVisibility: function() {

			var mlinks = this.cfg.maxLinks;
			if( mlinks > 0 ) {

				for( var i = 1; i < this.links.length - 1; i++ ) {

					if( i >= ( this.currentPage + mlinks ) || i <= ( this.currentPage - mlinks ) ) {

						this.links[ i ].hide();

					} else {

						this.links[ i ].show()

					}

				}

			} else {

				// Show the all numbered links (excluding previous and next)
				for( var i = 1; i < this.links.length - 1; i++ ) {
					this.links[i].show();
				}

			}

		},

		setLinksClasses: function() {

			var cp = this.currentPage;
			var mp = this.maxPages;

			for( var i = 0 ; i < this.links.length; i++ ) {

				if( i === cp ) { this.links[i].addClass("active"); }
				else { this.links[i].removeClass("active"); }				

			}

			// Toggle "disabled" class for Previous button
			if( this.links[ 0 ] !== undefined ) { 
				if( cp === 1 ) { this.links[0].addClass("disabled"); }
				else { this.links[0].removeClass("disabled"); }
			}
			// Toggle "disabled" class for Next button
			if( this.links[ mp ] !== undefined ) { 
				if( cp === mp ) { this.links[ mp + 1 ].addClass("disabled"); }
				else { this.links[ mp + 1 ].removeClass("disabled"); }
			}

		},

		removeLinks: function() {

			this.controls.empty();
			this.links = [];

		},

		getLinks: function() {

			var list = this.controls.find("li");
			if( list.length <= 0 ) { return false; }
			this.links = [];
			list.each(function(id){

				var link = $(list[id]);
				this.links.push(link);

			}.bind(this));

		}


	} );

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils, Glacier.internal );
 