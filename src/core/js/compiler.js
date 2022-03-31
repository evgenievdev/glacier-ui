(function( _core , utils , internal ){
	
	var _modname = "compiler";
	var _prefix = internal.prefix();
 	// Loaded module instances are stored in this object.
	var loaded = {};
	
	function process_module( id ) {
		
		var modules = internal.moduleList();
		if( id < 0 && id >= modules.length ) { return false; }
		var mod = modules[ id ];
		// If this module doesn't have a processor method, exit
		if( typeof _core.processors[ mod.name ] !== 'function' ) { return false; }
		// Execute the module's processor
		return _core.processors[ mod.name ]( _prefix , mod.tag , mod.cssClass );
	
	};
	
	function compile(debug) {
		
		if( debug ) {
			console.log("Glacier compiler - modules loaded:");
		}
		var modules = internal.moduleList();
		var mod, instances, t0 , t1 , dt;
		for( var i = 0 ; i < modules.length ; i++ ) {
	
			mod = modules[ i ];
			
			t0 = performance.now();
			instances = process_module( i );			
			t1 = performance.now();
			// skip this module if it is not imported 
			if( instances === false ) { continue; }
			loaded[ mod.name ] = instances;
			dt = t1 - t0;
			
			if( debug ) {
				console.log('%c ' + mod.name + ": " + loaded[ mod.name ].length +" ("+dt.toFixed(4)+"ms)", 'background: hsl( '+360/modules.length * i+', 50% , 50%); color: #fff; padding:2px;');
			}

		}	

		
	};
	
	// This runs silently in the background checking for changes in the dom
	function updater() {
	
	}
 	
 	// Public methods for the compiler
	_core[_modname] = {

		run: function(debug) {

			compile(debug);

		},

		update: function() {
			
			updater();

		},

		loadedModules: function() {

			return loaded;

		},

		moduleInstance: function(name,id) {

			var o = loaded[name];
			if( o == undefined || id < 0 || id >= o.length ) { return false; }
			return o[id];

		},	

		// Get rid of currently active modules
		flush: function() {

			var m,inst;
			for( var id in loaded ) {
				m = loaded[m];
				for( var i = 0; i < m.length; i++ ) {
					inst = m[i];
					if( typeof inst.destroy !== 'function' ) {continue;}
					// Every module with a processor should ideally have a destroy method.
					inst.destroy();
					
				}
			}
			// Reset loaded object
			loaded = {};

		}

	};
 
	
})( Glacier , Glacier.utils , Glacier.internal );
 
 