 (function( _core , utils , internal ) {

	//"use strict";
	var _modname = "filter";
 
	var instance = function( target , options, events ) {
 		
 		this.target = typeof target == 'string' ? $( target ) : target;
 
 		this.cfg = this.defaultSettings();
 		utils.applyProperties( this.cfg , options );
 
 		this.events = {
			 
		};
		utils.applyProperties( this.events , events );

		this.data = {};
		this.getElements();
		this.apply(true);

	}

	Object.assign( instance.prototype , {

		defaultSettings:function(){
		 	return {
		 		elementSelector: ".item"
		 	};
		},

		getElements: function() {

			//var es = this.cfg.elementSelector;
			var list = this.target.find("[gls-filter]");
			if( list.length <= 0 ) { return false; }
			this.data = {};

			list.each( function(id){
				
				var el = $(list[id]);
				var cat = el.attr("gls-filter");
				if( cat == undefined ) { return; }
				if( !this.filterExists(cat) ) { this.data[cat] = []; }
				this.data[cat].push( el );
 
			}.bind(this));

			this.apply( true );

		},

		apply: function( visible , exclude ) {

			// If visible is set to true, get all possible filter categories and show them
			if( visible == true ) { 
				visible = Object.keys( this.data );
			} 
			if( !visible.length ) { visible = [visible]; }
			var items,show;
			for( var id in this.data ) {
				items = this.data[id];
				show = visible.indexOf(id) < 0 ? false : true;
				if( exclude == true ) { show=!show; }

				this.toggleItems(id,show);
			}

		},

		toggleItems: function(id,show) {
			if( !this.filterExists(id) || !this.data[id].length ) { return false; }
			for( var i = 0 ; i < this.data[id].length; i++ ) {
				if( show == true ) { this.data[id][i].fadeIn(300); }
				else { this.data[id][i].fadeOut(300); }
			}
		},

		filterExists: function(id) {
			if( this.data[id] == undefined ) { return false; }
			return true;
		} 

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 