(function( _core , utils, internal ) {

	//"use strict";
	var _modname = "accordion";

	var instance = function( target , options ) {

		this.target = typeof target == 'string' ? $( target ) : target;

		this.items = this.target.find(".item");
		this.data = [];

		this.items.each( function(index){

			var item = $(this.items[index]);

			var link = item.find(".link");
			var open = item.find(".open");
			var close = item.find(".close");
			var content = item.find(".content");

			open.show();
			close.hide();

			open.click( function(){

				this.toggle("show",index);
				open.hide();
				close.show();

			}.bind(this) );

			close.click( function(){

				this.toggle("hide",index);
				close.hide();
				open.show();

			}.bind(this) );

			this.data.push({
				link: link,
				open: open,
				close: close,
				content: content
			});
 
		}.bind(this) );

		this.hideAll();

	}

	Object.assign( instance.prototype , {

		toggleAll : function( action , except ) {

			if( action !== "show" && action !== "hide" ) { return false; }

			if( except == undefined ) { except = []; }
			if( !except.length ) { except = [except]; }

			for( var i = 0 ; i < this.data.length; i++ ) {
	 			
				if( except.indexOf(i) >= 0 ) { continue; }

				this.data[i].content[action]();

				if( action == "show" ) {
					this.data[i].close.show();
					this.data[i].open.hide();
				} else if( action == "hide" ) {
					this.data[i].close.hide();
					this.data[i].open.show();
				}

			}

		},

		hideAll : function(except) {

			return this.toggleAll("hide", except);

		},

		showAll : function(except) {

			return this.toggleAll("show", except);

		},

		toggle : function( action , id ) {

			if( action !== "show" && action !== "hide" ) { return false; }
			var n = this.data.length;
			if( id < 0 || id >= n ) { return false; }

			if( action == "show" ) { this.hideAll(id); }
			
			this.data[id].content[action]();

		}

	});

	internal.defineModule( _modname , instance );


})( Glacier , Glacier.utils, Glacier.internal );

 