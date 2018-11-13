(function( _core , utils , internal ) {

	//"use strict";
 	var _modname = "css";
 	var _modname2 = "themer";

 	var _regex = /\[\[([^\]\]]+)\]\]/gi;	// Global , Case-insensitive

 	var _regexShortcuts = new RegExp('##([^##]+)##','gi');	// Global , Case-insensitive
 	// A list of shortcut keywords which can be used with a regex to allow the developer to quickly edit CSS properties, without having to define every specific variant of the CSS classes
 	var _shortcuts = {
 		"button": [".glacier .button"]
 	};

 	// -------------------------------------------------------------------------------------------------------------------------

 	var _iteratorShortcuts = function(match, p1, p2, p3, offset, string) {

			var trimmed = match.substr( 2 , match.length-4 ).trim();

		var c = trimmed.split(":");
		var key = c[0];
		var addon = c.length <= 1 ? '' : ":"+c[1].trim();
		// If the shortcut key doesn't exist in the defined keys list, don't attempt to replace anything for this match
		if( _shortcuts[key] == undefined ) {
			return match;
		}
		// Otherwise, compile a string of all classes attached to the 
		var classes = _shortcuts[key];
		if( !classes.length && typeof classes == 'string' ) {
			classes = [classes];
		}
		var res = '';
		for( var i = 0 ; i < classes.length; i++ ) {

			if( i > 0 ) { res+=','; }
			res += classes[i] + addon;
	 
		}
	 
		return res;

	};

	var _iteratorValues = function(match, p1, p2, p3, offset, string){
		
		// p1 is nondigits, p2 digits, and p3 non-alphanumerics

		// Get rid of the variable tags for the current match
		var trimmed = match.substr( 2 , match.length-4 );
		// Added support for multi-nested objects. E.g. "lang.level1.level2.property" is acceptable
		var c = trimmed.split(".");
		// But not only nested. Sometimes the first level is sufficient. Therefore we need to make that distinction
		var ref = c.length <= 1 ? this.data[ c[0] ] : utils.propertyRecursive( this.data , c , 0 , c.length );
		
		// Allow for custom methods to be set as properties by calling the associated method and set its returned value(s) as this one
		if( typeof ref == "function" ) {
			var varName = c[ c.length-1 ]; // The name of the variable in terms of its relative position in the data object (i.e. the property name)
			ref = ref( varName );
		}

		// If no reference is found within the template data, 
		if( ref == undefined || ref == false ) { return ""; }

		return ref;

	};

 	var parseCSS = function( data , rules ) {

 		var fixed = rules.replace( _regexShortcuts , _iteratorShortcuts );
		var code = fixed.replace( _regex , _iteratorValues.bind({ data: data }) );
		return code;

 	};

 	var buildStyle = function(id,data) {
 		// Create a <style> element and set its css data to match the parsed data.
		var css = $('<style>');  
		css.attr("type","text/css"); 
		css.attr("id", id ); 
		css.text( data );
		return css;
 	}

 	// -------------------------------------------------------------------------------------------------------------------------

 	var parser = function() {

 		this.templates = {};
 		this.stylesheets = {};

 	}

 	Object.assign( parser.prototype , {

 		exists: function(id) {

 			if( this.stylesheets[id] !== undefined && typeof this.stylesheets[id] === 'object' ) {
 				return true;
 			}
 			return false;

 		},

 		extractVariables: function( data ) {

 			var matches = data.match( _regex );
 			if( matches == null ) { return matches; }
 			// Remove the brackets from the variable matches.
 			for( var i = 0 ; i < matches.length; i++ ) {
 				matches[i] = matches[i].replace(/\[/g,'').replace(/\]/g,'');
 			}
 			return matches;

 		},

 		parse: function( data , rules ) { 
 			
 			return parseCSS(data,rules);

 		},

 		inject: function( id , data , rules , target , prepend ) {

 			// Parse the raw css rulesets 
 			var parsed = this.parse( data , rules );
 			// Create a <style> element and set its css data to match the parsed data.
 			var css = buildStyle(id,parsed);
			// If this stylesheet ID is already taken, remove the current style from the DOM first
			if( this.exists(id) ) {
 				this.stylesheets[id].parsed.remove();
 			}
 			// Then inject the new style
			this.stylesheets[id] = {
				
				raw: rules,				// Raw css data with variables intact
				parsed: css,			// Style element of parsed css data after replacing variables with values
				parent: target			// The target where this stylesheet is injected

			};
			// In some cases you may wish to alter the order of injection. Prepending will add the style at the very top of the target element. Appending - at the bottom.
			var func = prepend == true ? "prependTo" : "appendTo";
			css[func]( target );

 		},

 		/**
 		*	
 		*/
 		append: function( id , data , rules ) {

 			// You can't append css to a non-existing stylesheet. Therefore exit early and return false
 			if( !this.exists(id) ) { return false; }
 			// Parse the raw css rulesets 
 			var parsed = this.parse( data , rules );
 			// Inject rulesets into existing stylesheet
 			this.stylesheets[id].parsed.append( parsed );
 			// Once the css has been injected, return true to show that the method call is successful.
 			return true;

 		},

 		remove: function( id ) {

 			if( !this.exists(id) ) { return false; }
 			this.stylesheets[id].parsed.remove();
 			delete this.stylesheets[id];
 			return true;

 		} 

 	});

 	// ------------------------------------------------------------ THEMER MODULE ---------------------------------------------

 	var themer = function( cfg ) {

 		cfg = cfg || {};
 
 		// Create an instance of the CSS parser
 		this.engine = new parser();
 		// Theme stylesheet (template)
 		this.template = false;
 		// The stylesheet object
 		this.stylesheet = false;
 		this.setTemplate( cfg.template );
 		// Various themes
 		this.themes = {};
 		this.active = false;
 		// User-defined event callbacks
 		this.events = {
 			onThemeChange: false,
 			onThemeCompile: false
 		};
 		utils.applyProperties( this.events , cfg.events );

 	}

 	Object.assign( themer.prototype , {

 		getThemes: function() {
 			return Object.keys( this.themes );
 		},
 		change: function( delta ) {
 			var themes = this.getThemes();
 			var cID = themes.indexOf( this.active );
 			if( cID < 0 ) { return false; }
 			// -1 = Previous. If the current theme is the first one, there is no previous theme
 			if( delta == -1 && cID < 1 ) { return false; }
 			if( delta == 1 && cID >= themes.length-1 ) { return false; }
 			if( delta == "first" ) { return this.apply( themes[0] ); }
 			if( delta == "last" ) { return this.apply( themes[ themes.length-1 ] ); }
 			return this.apply( themes[ cID + delta ] );
 		},
 		next: function() {
 			return this.change(1);
 		},
 		previous: function() {
 			return this.change(-1);
 		},
 		first: function() {
 			return this.change("first");
 		},
 		last: function() {
 			return this.change("last");
 		},
 		setTemplate: function( rules ) {
 			if( typeof rules !== 'string' ) { return false; }
 			this.template = rules;
 			return true;
 		},
 		loadTemplate: function( file , onLoad , onFail ) {
 			$.ajax({
			  method: "GET",
			  url: file,
			  dataType: "text"
			})
			.done( function(data){
				this.setTemplate( data );
				if( typeof onLoad ==='function'){ onLoad(); }
			}.bind(this))
			.fail(function(){
				console.log("Stylesheet ["+file+"] could not be loaded");
				if( typeof onFail ==='function'){ onFail(); }
			}.bind(this));
 		},
 		exists: function( id ) {
 			if( this.themes[id] == undefined && typeof this.themes[id] !== 'object' ) { return false; }
 			return true;
 		}, 
 		remove: function( id ) {
 			if( !this.exists(id) ) { return false; }
 			if( this.active === id && typeof this.stylesheet === 'object' ) {
 				this.stylesheet.remove();
 				this.active = false;
 			}
 			delete this.themes[id];
 			return true;
 		},
 		clear: function( id ) {
 			if( this.active == false || !this.exists( this.active ) ) { return false; }
			this.engine.remove( this.active );
			this.active = false;			 
 			return true;
 		},
 		define: function( id , data ) {
 			if( this.exists(id) || typeof data !== 'object' ) { return false; }
 			this.themes[id] = {
 				data: data,
 				compiled: false
 			}
 			this.compile( id );
 			return true;
 		},
 		set: function( id , data ) {
 			if( !this.exists(id) ) { return false; }
 			this.themes[id].data = data;
 			this.compile( id );
 			return true;
 		},
 		compile: function( id ) {
 			if( !this.exists(id) 
 				|| typeof this.themes[id].data !== 'object' 
 				|| typeof this.template !== 'string'
 			) { return false; }
 			var parsed = parseCSS( this.themes[id].data , this.template );
 			this.themes[id].compiled = parsed;
 			return true;
 		},
 		apply: function( id , target ) {
 			if( !this.exists(id) || typeof this.themes[id].compiled !== 'string' ) { return false; }
 			if( typeof target == 'string') { target = $(target); }
 			else if( target == undefined ) { target = $("head"); }
 			var theme = this.themes[id];
 			if( typeof this.stylesheet === 'object' && typeof this.stylesheet.text === 'function' ) {
 				this.stylesheet.text( theme.compiled );
 			} else {
 				this.stylesheet = buildStyle( id , theme.compiled );
 				this.stylesheet.appendTo( target );
 			}
 			this.active = id;
 			return true;
 		}

 	});

 	internal.defineModule( _modname , parser );
 	internal.defineModule( _modname2 , themer );
	 
})( Glacier , Glacier.utils , Glacier.internal );

