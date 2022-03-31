(function( _core , utils, internal ) {

	//"use strict";
	var _modname = "accordion";

	var _anims = {
		"show": "slideDown",
		"hide": "slideUp"
	};

	_core.processors[_modname] = function( tagPrefix , tag , cssClass ) {
		
		var $accordions = $( tagPrefix + tag ); 
		var accordions = new Array( $accordions.length );
		var c;
		$accordions.each(function( index ) {
		
			c = $(this);
			var accordion = c.children( cssClass );
			var options = {
				parallel : c.attr('parallel') == "true" ? true : false,
				opened : c.attr('opened') == "true" ? true : false,
				animation : c.attr('animation') == "false" ? false : true,
				duration : c.attr('duration') == undefined ? 400 : parseInt( c.attr('duration') )
			};
			 
			accordions[ index ] = new instance( accordion , options );
		
		});
		
		return accordions;
		
	};

	var instance = function( target , options ) {

		options = options || {};
		this.target = typeof target == 'string' ? $( target ) : target;
		this.vertical = this.target.hasClass("vertical") ? true : false;

		this.cfg = this.defaultSettings();
		utils.applyProperties( this.cfg , options );
		this.events = {
			onOpen: false,
			onClose: false,
			onOpenAll: false,
			onCloseAll: false
		};
		utils.applyProperties( this.events , options.events );

		this.findItems();

		if( !this.cfg.opened ) {
			this.hideAll();
		} else {
			this.showAll();
		}

	}

	Object.assign( instance.prototype , {

		defaultSettings: function() {
			return {
				animation: true,
				duration: 400,
				parallel: false,
				opened: false,
				itemSelector: ".item",
				linkSelector: ".link",
				contentSelector: ".content"
			};
		},

		findItems: function() {

			this.items = this.target.children( this.cfg.itemSelector );
			this.data = [];

			this.items.each( function(index){

				var item = $(this.items[index]);

				var link = item.children(this.cfg.linkSelector);
				var open = link.find(".open");
				var close = link.find(".close");
				var content = item.children(this.cfg.contentSelector);

				open.show();
				close.hide();

				open.click( function(index){

					this.toggle("show",index);
					open.hide();
					close.show();

				}.bind(this,index) );

				close.click( function(index){

					this.toggle("hide",index);
					close.hide();
					open.show();

				}.bind(this,index) );

				this.data.push({
					link: link,
					open: open,
					close: close,
					content: content
				});
	 
			}.bind(this) );

		},

		toggleAll : function( action , except ) {

			if( action !== "show" && action !== "hide" ) { return false; }

			if( except == undefined ) { except = []; }
			if( !except.length ) { except = [except]; }
 
 			var ac = this.cfg.animation ? _anims[action] : action;
 			var dur = this.cfg.animation ? this.cfg.duration : 0;
			 
			for( var i = 0 ; i < this.data.length; i++ ) {
	 		 
				if( except.indexOf(i) >= 0 ) { continue; }

				var d = this.data[i];
				if( action == "show" ) {
					d.close.show();
					d.open.hide();
				} else if( action == "hide" ) {
					d.close.hide();
					d.open.show();
				}


				if( this.vertical ) {
					if( action == "show" && d.content.is(":visible") ) { continue; }
					if( action == "hide" && d.content.is(":hidden") ) { continue; }
					d.content.stop().animate({ width:"toggle" },dur);
				} else {
					d.content.stop()[ ac ]( dur );
				}

			}

			var ev = this.data;
			if( action == "show" ) {
				if( typeof this.events["onOpenAll"] === 'function' ) {
					this.events["onOpenAll"]( ev );
				}
			} else {
				if( typeof this.events["onCloseAll"] === 'function' ) {
					this.events["onCloseAll"]( ev );
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

			if( action == "show" && !this.cfg.parallel ) { this.hideAll(id); }
			var dc = this.data[id].content;
			var ac = this.cfg.animation ? _anims[action] : action;
			var dur = this.cfg.animation ? this.cfg.duration : 0;
			if( this.vertical ) {
				if( action == "show" && dc.is(":visible") ) { return; }
				if( action == "hide" && dc.is(":hidden") ) { return; }
				dc.stop().animate({ width:"toggle" },dur);
			} else {
				dc.stop()[ ac ]( dur );
			}

			// Event callbacks
			var ev = this.data[id];
			if( action == "show" ) {
				if( typeof this.events["onOpen"] === 'function' ) {
					this.events["onOpen"]( ev );
				}
			} else {
				if( typeof this.events["onClose"] === 'function' ) {
					this.events["onClose"]( ev );
				}
			}

		}

	});

	internal.defineModule( _modname , instance , _modname , "."+_modname );


})( Glacier , Glacier.utils, Glacier.internal );

 