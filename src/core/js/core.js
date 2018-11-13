// ----------------------------------------------------------------------------------------
// Glacier-UI : Core
// ----------------------------------------------------------------------------------------
var Glacier = (function() {
			
	"use strict";
	
	// The prefix for all modules tags
	var _glacierPrefix = "gl-";

	var _moduleList = [];
 
	return {
		processors: {},
		internal: {
			prefix: function() { return _glacierPrefix; },
			// Define a module in the Glacier namespace (or define as module export)
			defineModule: function( name , instance , compilerTag , selector ) {
				if( typeof instance !== 'function' && typeof instance !== 'object' ) { return false; }
				if( this.moduleExists(name) ) { return false; }
				if (typeof exports === "object") {
					module.exports[name] = instance;
				} else {
					Glacier.modules[name] = instance;
				}
				_moduleList.push({
					name: name,
					tag: compilerTag,
					cssClass: selector
				});
				return true;
			},
			moduleList: function() {
				// Return a copy of the module list object (instead of a reference)
				return JSON.parse(JSON.stringify(_moduleList));
			},
			moduleExists: function(name) {
				for( var i = 0 ; i < _moduleList.length; i++ ) {
					if( _moduleList[i].name === name ) { return true; }
				}
				return false;
			}
		}
	};

})();

// ES6 Module support
if (typeof exports === "object") { 
	module.exports.core = Glacier; 
} else {
	Glacier.modules = {};
}

