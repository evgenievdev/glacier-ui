(function( _core , utils , internal ) {

	//"use strict";

	var _defaultTag = internal.prefix() + "template";
	var _modname = "templating";

	var _regex = /\[\[([^\]\]]+)\]\]/gi;	// Global , Case-insensitive


	var instance = function() {
 
		this.templates = {};

	}

	Object.assign( instance.prototype , {

		templateExists: function( name ) {

			if( this.templates[name] == undefined ) { return false; }
			return true; 

		},

		loadTemplate: function( name , data , useAJAX ) {

			if( typeof data == "function" ) {

				this.templates[name] = {
					data: data()
				};
				this.templates[name].variables = this.templates[name].data.match(_regex);

			} else if( typeof data == "string" ) {

				if( useAJAX == true ) {

					function set(template) {

						// Create a JQuery object from the text data retrieved in this template file
						var $template = $(template);

						var sub = [];
						var block;
						// Go through the recognized element blocks and find the template declarations
						for( var i = 0 ; i < $template.length; i++ ) {
							block = $template[i];
							if( block.localName == _defaultTag ) {
								var attr = block.attributes["name"].nodeValue;
								var html = block.innerHTML;
								sub.push({
									name: attr,
									html: html
								});
							}
						}
 						// If there are no template declarations, then this is a single template file and the entire text data is the template.
						if( sub.length <= 0 ) {
							this.templates[name] = {
								data: template
							};
							this.templates[name].variables = template.match(_regex);
							return;
						} 
						// Otherwise there are template declarations, which means that there are multiple templates stored in this file. Read each of them and store it for later use.
						else {
							for( var i = 0 ; i < sub.length; i++ ) {
								this.templates[ sub[i].name ] = {
									data: sub[i].html
								};
								this.templates[ sub[i].name ].variables = sub[i].html.match(_regex);
							}
						}
  

					}

					$.ajax({
		                type : 'GET',
		                url : data,
		                dataType : 'text',
		                timeout : 5000,
		                success : set.bind(this),
		                error : function(error) {
		                    console.log("Template ["+cfg.data+"] could not be loaded.")
		                }
			        });

				} else {

					this.templates[name] = {
						data: data()
					};
					this.templates[name].variables = this.templates[name].data.match(_regex);

				}

			}

		},

		loadTemplates: function( data ) {

			if( !data.length ) { return false; }

			var t, name, ajax;
			for( var i = 0 ; i < data.length; i++ ) {

				t = data[i];
				name = t.name == undefined ? null : t.name;
				ajax = t.ajax == true ? true : false;
				this.loadTemplate( name , t.data , ajax );

			}

		},
 
		cloneTemplate: function( name , newName ) {

			if( !this.templateExists(name) || this.templateExists(newName) ) { return false; }
			this.templates[newName] = JSON.parse( JSON.stringify( this.templates[name] ) );
			return true;

		},
 

		inject: function( target , name , data , unwrap ) {

			// If this template doesn't exist, exit method and return false
			if( !this.templateExists(name) ) { return false; }
			// Get the template reference
			var template = this.templates[name].data;
			var variables = this.templates[name].variables;

			// If this is simply an empty template with text only (no variables), append HTML and exit method
			if( variables == null || variables.length <= 0 ) {
 
				var $result = $( $.parseHTML(template) ).appendTo(target);
				return $result;

			}
			 
			// After taking the template data and storing a copy of it, replace all template variables with the defined values in the template data object
			var wrapUUID = utils.uuid();
			var instance = '<'+_defaultTag+'-cluster uuid="'+wrapUUID+'">';
			instance += template.replace( _regex , this._iterator.bind({ data: data , name: name , target: target , templates: this.templates }) );
			instance += '</'+_defaultTag+'-cluster>';
			var $instance = $.parseHTML(instance);
			// Add the new template instance to the DOM
			var $result = $( $instance ).appendTo(target);
			 
			// Finally, check for any sub-template declarations. If such things exist, recursively render them using this injector
			var sub = target.find( _defaultTag+'-cluster[uuid="'+wrapUUID+'"] '+_defaultTag );
			// Iterate through all template declarations and find the number of instances to be rendered for each template type
			var unique = {};
			var current = {};

			sub.each(function(index){

				var t = $(sub[index]); 
				var name = t.attr("name").trim();
				if( !this.templateExists(name) ) { return; }
				// We need to keep track of how many iterations there are for each template name in order to assign the right data structure
				if( unique[name] == undefined ) { unique[name] = 1; } else { unique[name] += 1; }
				if( current[name] == undefined ) { current[name] = 0; }
 

			}.bind(this));
			// Iterate through all template declarations and attempt to instantiate them 
			sub.each( function(index) {
 
				var t = $(sub[index]);
				var name = t.attr("name").trim();
				var thisUUID = t.attr("uuid");
				// If this template doesn't exist, skip this iteration, Otherwise, instantiate the template
				if( !this.templateExists(name) ) { return; }
				 
				// If only one iteration exists 
				var tData;
				if( data[name] == undefined ) { tData = data; }
				else {
					if( unique[name] <= 1 ) { tData = data[name]; }
					else { tData = data[name][ current[name] ]; }
				}

				current[name] += 1;
				// Finally, inject the template (this creates a recursive cycle)
				this.inject( t , name , tData , true );

			}.bind(this));

			// Remove the temporary tags
			//target.find( _defaultTag ).contents().unwrap();
			//target.find( _defaultTag + "-cluster").contents().unwrap();
			 
			return $result;

		},
 
		_iterator: function(match, p1, p2, p3, offset, string){
			
			// p1 is nondigits, p2 digits, and p3 non-alphanumerics
 
			// Get rid of the variable tags for the current match
			var trimmed = match.substr( 2 , match.length-4 );
			// Get the first character of the trimmed variable reference 
			var fc = trimmed.substr(0,4);
			// If the first character is a ">", then this block is a reference to another template
			if( fc == "&gt;") {
				// Remove the sign and trim whitespace
				var name = trimmed.substr( 4 , trimmed.length-4 ).trim();
				// Check to see if this template exists (is loaded). If not, replace the declaration with an empty string
				if( this.templates[name] == undefined ) { return ""; }

				// A UUID is necessary to be able to distinguish each instance of the same template type
				var uuid = utils.uuid();
				var single = '<'+_defaultTag+' name="'+name+'" uuid="'+uuid+'"></'+_defaultTag+'>\n';

				var variables = this.templates[name].variables;	
				
				var ref = this.data[ name ];

				if( (ref == undefined || ref == false) && variables !== null ) { return ""; }
				else if( variables == null ) { return single; }

				if( typeof ref == "function") {
					ref = ref( name );
				}
				
				var res = '';
				if( ref.length && ref.length > 0 ) {
					for( var i = 0 ; i < ref.length; i++ ) {
						res += single;
					}
				} else {
					res = single;
				}

				// Otherwise create a template element. This is used by the injector to recursively inject sub-templates in the right places
				return res;
			}

			// Added support for multi-nested objects. E.g. "lang.level1.level2.property" is acceptable
			var c = trimmed.split(".");
			// But not only nested. Sometimes the first level is sufficient. Therefore we need to make that distinction
			var ref = c.length <= 1 ? this.data[ c[0] ] : utils.propertyRecursive( this.data , c , 0 , c.length );
 		
			// Allow for custom methods to be set as properties by calling the associated method and set its returned value(s) as this one
			if( typeof ref == "function") {
				var varName = c[ c.length-1 ]; // The name of the variable in terms of its relative position in the data object (i.e. the property name)
				ref = ref( varName );
			}

			// If no reference is found within the template data, 
			if( ref == undefined || ref == false ) { return ""; }

			return ref;

		} 

	} );

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );
 