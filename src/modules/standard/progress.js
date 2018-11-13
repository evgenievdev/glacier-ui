(function( _core , utils , internal ) {

	//"use strict";
	var _modname = "progress";

	_core.processors[_modname] = function( tagPrefix , tag , cssClass ) {

	}

	var instance = function( target , options ) {
		
		this.target = typeof target == 'string' ? $( target ) : target;
		this.cfg = this.defaultSettings();
		utils.applyProperties( this.cfg , options );
		this.bars = [];

		this.setup();

	}

	Object.assign( instance.prototype , {

		 defaultSettings : function() {

			return {

				horizontal: false,		// True if you want the bars to be aligned horizontally, false otherwise
				precise: true,			// Set to true if you want the progress bar visuals to be accurate. Otherwise only entire blocks will be colored.
				min: 0,
				max: 100,
				value: 0,
				colors: "default",		// "default" uses the CSS property for .inner class ; Otherwise you can supply an array of repeating colors to apply to the progress bars ; Colors can be any CSS admissible format written as a String
				fliped: false,
				map: false				// The value parameter can be mapped to a curve. This way the value parameter may be set to have a non-linear relationship with the progress bar visuals. The map is an array of values from 0.0 to 1.0.

			};

		},

		 getValueProportion : function() {

			var range = Math.abs(this.cfg.max - this.cfg.min);
			var val = Math.abs(this.cfg.value - this.cfg.min) / range;

			var map = this.cfg.map;
			if( map.length && map.length >= 2 ) {

				var mn = map.length;
				// If only 2 values exist, the map is assumed to be linear
				if( mn == 2 || val <= 0 || val >= 1 ) { return val; }

				var res = val;
				var a = (mn-1) * val; // e.g. val == 0.5 on map = [0 , 1] => a = 0.5 => res = a[0] + (a[1]-a[0])*0.5
				var id = Math.floor(a);
				res = map[ id ] + ( map[id+1] - map[id] )*(a-id);
				return res;

			}

			return val;

		},

		getValuePercent : function() {

			return this.getValuePercent()*100;

		},

		 setup : function() {

			this.cfg.horizontal = this.target.hasClass("horizontal") ? true : false;
			var bars = this.target.find(".bar");


			bars.each( function(index){

				var bar = $(bars[index]);
				var inner = bar.find(".inner");
				 
				this.bars.push({
					bar: bar,
					inner: inner
				})
				
	 			 
			}.bind(this) );

			this.resizeBars();

			// The progress bar container has been resized, therefore adjust the bar's inner elements
			this.sensor = new utils.resizeSensor( this.target , function(){ 
			    this.resizeBars();
			}.bind(this) );

			this.setValue( this.cfg.value );

		},

		 setValue : function( v ) {

			var min = this.cfg.min;
			var max = this.cfg.max;
			var nv = utils.clamp(v,min,max);
			this.cfg.value = nv;

			this.updateBars();

		},

		 setPrecise : function( v ) {

			if( v !== true && v !== false ) { return false; }
			this.cfg.precise = v;
			this.setValue( this.cfg.value );

		},

		 resizeBars : function() {

			var nb = this.bars.length;
			if( nb <= 0 ) { return false; }

			// Dimensions of entire progress bar (parent of smaller bars) ; Takes into account any CSS padding properties added to .progress class
			var pw = this.target.width();
			var ph = this.target.height();


			// Margins (needed for correct calculations of bar dimensions)
			var inst = this.bars[0].bar;	// Take the first bar instance to measure all others
			var ml = parseFloat( inst.css("marginLeft") );
			var mr = parseFloat( inst.css("marginRight") );
			var mt = parseFloat( inst.css("marginTop") );
			var mb = parseFloat( inst.css("marginBottom") );

	 		// Calculate the new dimensions of the bars relative to the dimensions of the progress bar's wrapper.
			var bw, bh;
			if( this.cfg.horizontal == true ) {
				bw = pw/nb - (ml+mr);
				bh = ph - (mt+mb);
			} else {
				bw = pw - (ml+mr);
				bh = ph/nb - (mt+mb);
			}
	 
			for( var i = 0 ; i < nb; i++ ) {

				this.bars[i].bar.css({
					width: bw+"px",
					height: bh+"px"
				});

			}

		},

		 getLinearHSL : function( percent ) {

			var cols = this.cfg.colors;
			if( typeof cols !== "object" || Object.keys(cols).length <= 0 ) { return false; }
	 
			var h = percent * (cols.maxH - cols.minH) + cols.minH;
			var s = percent * (cols.maxS - cols.minS) + cols.minS;
			var l = percent * (cols.maxL - cols.minL) + cols.minL;

			return {
				h: h,
				s: s,
				l: l
			};

		},

		 getLinearHSLinCSS : function( percent ) {

			var c = this.getLinearHSL( percent );
			if( c == false ) { return false; }
			return "hsl( "+c.h+" , "+c.s+"% , "+c.l+"% )";

		},

		 updateBarColor : function( i ) {

			var nb = this.bars.length;
			if( nb <= 0 || i < 0 || i >= nb ) { return false; }
			var cols = this.cfg.colors;

			if( cols.length && cols.length > 0 ) {

				this.bars[i].inner.css("background", cols[ i % cols.length ] );

			} else if( typeof cols == "object" && Object.keys(cols).length > 0 ) {

				var hsl = this.getLinearHSLinCSS( ( i / (nb-1) ) );
				if( hsl !== false ) { 
					this.bars[i].inner.css( "background" , hsl );
				}

			}

		},

		 updateBars : function() {

			var nb = this.bars.length;
			if( nb <= 0 ) { return false; }

			var h = this.cfg.horizontal;
			var valProp = this.getValueProportion();
			var ap = nb * valProp;
			// Get number of array indexes that are affected by the current progress value
			var full = Math.floor(ap);
			// Get the proportion of the last bar's filled progress. (range 0.0-1.0). Used only if progress bar is set to "precise=true"
			var rest = ap - full;
	 		// Color definitions for all bars that are within the current value's range. By default the CSS class .inner's background property is used. The user can assign an array of colors which are cycled
			var cols = this.cfg.colors;
			 

			var sp, hsl, id;
			for( var i = 0 ; i < nb; i++ ) {

				sp = i < full ? "100%" : "0%";
				id = h == true ? i : nb - i - 1;

				this.bars[id].inner.css({
					width: sp,
					height: sp
				});

				this.updateBarColor( id );

	 		}

	 		if( this.cfg.precise == true && rest > 0 ) {
	 			
	 			id = h == true ? full : nb - full - 1;

	 			if( h == true ) { 

		 			this.bars[ id ].inner.css({
		 				width: 100*rest + "%",
						height: "100%"
		 			});

		 			if( this.cfg.fliped == true ) { 
			 			this.bars[id].inner.css({right: '0px', left: '', bottom: '', top: ''});
			 		} else {
			 			this.bars[id].inner.css({right: '',left: '0px',bottom: '',top: ''});
			 		}


		 		} else {

		 			this.bars[ id ].inner.css({
		 				width: "100%",
						height: 100*rest + "%"
		 			});
		 			var ih = this.bars[id].inner.height();
		 			var barH = this.bars[id].bar.height();
	 				
	 				if( this.cfg.fliped == true ) { 
	 					this.bars[id].inner.css({right: '',bottom: '',top:'0px',left:''});
	 				} else { 
			 			this.bars[id].inner.css({right: '',bottom: '0px',top:'',left:''});
			 		}

		 		}

		 	 

		 		this.updateBarColor( id );

	 		}



		}

	});

	internal.defineModule( _modname , instance );
	 

})( Glacier , Glacier.utils , Glacier.internal );
 