(function( _core , utils , internal ) {

	//"use strict";
	var _modname = "tree";

	_core.processors[_modname] = function( tagPrefix , tag , cssClass ) {

	}

	var instance = function( target ) {

		this.target_id = target;
		this.target = document.getElementById( this.target_id );

		this.data = {};

		this.nodes = [];
	 	
		this.selected = {};

		this.settings = this.default_settings();
		
	};

	Object.assign( instance.prototype , {
  
		  

		 default_settings : function() {

			return {
				multiselect: false,
				folder_class_open: "fa fa-folder-open-o",
				folder_class_closed: "fa fa-folder-o",
				file_class: "fa fa-file-o",
				noselect: true,
				jquery_animations: true,
				jquery_transition_delay: 200,
				aria_row: "aria-selected",
				aria_icon: "aria-expanded",
				devreport: false
			};

		},

		uuid : function() {

			return utils.uuid();

		},

		 dev_message : function( msg ){

			if( this.settings.devreport !== true ) {
				return;
			}

			console.log( msg );

		},

		 _recursive : function( chunk , parent ) {

			var el , type , new_node;

			for( var e in chunk ) {

				type = this.is_object( chunk[ e ] ) ? 1 : 0;

				new_node = this.insert( type , e , parent )

				if( type == 1 && Object.keys( chunk[ e ] ).length > 0 ) {

					this._recursive( chunk[ e ] , new_node );

				}

			}

		},
		 

		 load_data : function( obj , append , parent ) {

			var start = null;

			if( append !== true ) {

				this.clear_tree();

			} else {

				if( parent !== undefined ) {

					start = parent;

				};

			}
		 

			this._recursive( obj , start ); 

		},

		 clear_tree : function( reset_settings ) {

			this.selected = {};
			this.data = {};

			while (this.target.firstChild) {

			    this.target.removeChild(this.target.firstChild);

			}

			if( reset_settings == true ) {

				this.settings = this.default_settings();

			}

		},

		 insert : function( type , name , parent , class_icon_open , class_icon_closed ) {
		 	
		 	// type: 1 = node with children (folder) , 0 = independent node (file); 
		 	// Use default icons, unless custom fontAwesome classes are specified. 
		 	// Custom icon for independent nodes without children is defined in the class_icon_open parameter. 
			class_icon_open = class_icon_open || ( type == 1 ) ? this.settings.folder_class_open : this.settings.file_class;
			class_icon_closed = class_icon_closed || this.settings.folder_class_closed;

			// Generate a unique id for this node. This is done since all nodes are kept in one nesting level within this.data.
			// To avoid clashes with nodes who have the same name(which should be allowed, especially with nested nodes), the reference point for each node is a uuid
			var id = this.uuid();

			var target , parent_div, parent_id;

			// If no parent is set, then create at root level
			if( parent == undefined || parent == null ) { 
				parent_div = this.target; 
				parent_id = false;
			} else {
				parent_div = parent.child_div;
				parent_id = parent.id;
			}

			target = this.data;

			// Node already exists => exitfunction
			if( target[ id ] !== undefined ) {
				return false;
			}
		 
			var row = document.createElement( 'div' );
			row.className = "row";

			var li = document.createElement( 'li' );
			li.setAttribute( 'aria-selected' , 'false' );

			var i = document.createElement( 'i' );
			i.className = class_icon_open;

			row.appendChild( i );
			li.innerHTML += name;
			row.appendChild( li );
			parent_div.appendChild( row );


			// Base structure for any type
			target[ id ] = {
				type: type,
				id: id,
				name: name,
				selected: false,
				parent_id: parent_id,
				parent_div: parent_div,
				// HTML reference points for all parts of the tree node.
				elements: {
					row: row,
					icon: i,
					link: li
				},
				icon_classes: {
					open: class_icon_open,
					closed: class_icon_closed
				}
			 
			};
		 	
		 	// Add the id reference for this node to it's parent's children attribute (if the node has a parent)
			if( parent_id !== false ) {

				target[ parent_id ].children[ id ] = true;

			}
		 
			// If this is a folder, we need additional properties
			if( type == 1 ) {

				var div = document.createElement( 'div' );
				div.className = "nesting";

				target[ id ].open = true;
				target[ id ].children = {};
				target[ id ].child_div = div; // The reference to the div wrapper for all child elements will be written here
				row.appendChild( div );

				li.setAttribute( 'aria-expanded' , 'true' );

				// Event handler for opening/closing folder
				i.onclick = function() { 

					this.toggle_node( id );

				}.bind(this);
		 


			}

			// Event handler for selecting/de-selecting nodes
			li.onclick = function() {

				this.select_node( id );

			}.bind( this );


			// Return data. When creating child nodes, this is used to specify the parent
			return target[ id ];

		},

		 toggle_node : function( node ) {

			var id = this.determine_id( node );

			var data = this.data[ id ];

			var li = data.elements.link;
			var i = data.elements.icon;

			var expanded = li.getAttribute( 'aria-expanded' );

			if( expanded == 'true' ) {

				li.setAttribute( 'aria-expanded' , 'false' );
				i.className = data.icon_classes.closed;
				data.open = false;

				$( data.child_div ).slideUp( 200 , function(){

					this.dev_message( 'Folder [id:'+id+']['+data.name+'] collapsed.' );

				}.bind(this) );


			} else {

				li.setAttribute( 'aria-expanded' , 'true' );
				i.className = data.icon_classes.open;
				data.open = true;

				$( data.child_div ).slideDown( 200 , function(){

					this.dev_message( 'Folder [id:'+id+']['+data.name+'] expanded.' );

				}.bind(this) );

			}

		},

		 select_node : function( node , multiselect ) {
			console.time('select');
			var id = this.determine_id( node );

			// Either use a custom parameter, or assume the default parameter for this entire tree instance
			multiselect = multiselect || this.settings.multiselect;

			var data = this.data[ id ];

			var li = data.elements.link;

			var selected = li.getAttribute( 'aria-selected' );

			if( selected == 'true' ) {

				li.setAttribute( 'aria-selected' , 'false' );
				li.className = "";
				data.selected = false;

				delete this.selected[ id ];

				this.dev_message( 'Node [type:'+data.type+'][id:'+id+']['+data.name+'] de-selected.' );

			} else {

				// if multiple selections are not allowed, de-select any selected nodes before selecting a single new node
				if( multiselect == false ) {

					this.clear_selected();

					if( selected.length > 0 ) { 
						this.dev_message( "Multi-select is disabled. Number of nodes de-selected first: " + selected.length );
					}

				}

				li.setAttribute( 'aria-selected' , 'true' );
				li.className = "selected";
				data.selected = true;

				this.selected[ id ] = true;

				this.dev_message( 'Node [type:'+data.type+'][id:'+id+']['+data.name+'] selected.' );

			}
			console.timeEnd('select');
		},

		 clear_selected : function() {

			if( Object.keys( this.selected ).length == 0 ) {

				return false;

			}

			var li;
			for( var e in this.selected ) {

				li = this.data[ e ].elements.link;

				li.setAttribute( 'aria-selected' , 'false' );
				li.className = '';

			}

			this.selected = {};

			return true;

		},
		 

		 is_object : function( val ) {

			if( val !== null && typeof val === 'object' ) {

				return true;

			}

			return false;

		},

		 remove_children: function( node ) {

			var id = this.determine_id( node );

			if( this.data[ id ] == undefined ) {

				return false;

			}

			var data = this.data[ id ];
			var children = data.children;
			var count = Object.keys( children ).length;
		 
			if( count == 0 ) {

				return false;

			}

			var this_node;
			for( var e in data.children ) {

				this_node = this.data[ e ];

				this.remove( this_node , true );		 

			}


		},

		 remove : function( node , remove_children ) {

			var id = this.determine_id( node );

			if( this.data[ id ] == undefined ) {

				return false;

			}

			var data = this.data[ id ];

			// Remove from selected stack if node is selected
			if( this.selected[ id ] !== undefined ) {

				delete this.selected[ id ];

			}
			console.log(data.name);
			if( data.type == 1 ) { 

				if( remove_children == true ) {

					this.remove_children( data );

				} else {

					this.detach_children( data );
		 
				}

			} 

			data.parent_div.removeChild( data.elements.row );

			delete this.data[ id ];

		},

		 rename : function( node , name ){

			var id = this.determine_id( node );

			if( this.data[ id ] == undefined || this.data[ id ].name == name ) {

				return false;

			}

			this.data[ id ].name = name;
			this.data[ id ].elements.link.innerHTML = name;

			return true;

		},

		 detach_children : function( node ) {

			var id = this.determine_id( node );

			if( this.data[ id ] == undefined ) {

				return false;

			}

			var this_node = this.data[ id ];

			if( this_node.type !== 1 ) {

				return false;

			}

			for( var child in this_node.children ) {

				this.data[ child ].parent_id = this_node.parent_id;

				this_node.parent_div.appendChild( this.data[ child ].elements.row );

			}

			return true;

		},

		 determine_id : function( obj ) {

			return ( this.is_object( obj ) && obj.id !== undefined ) ? obj.id : obj;

		},

		 convert : function( node , type , open ) {

			var id = this.determine_id( node );

			if( this.data[ id ] == undefined || type == undefined || this.data[ id ].type == type ) {

				return false;

			}

			var this_node = this.data[ id ];

			// If the type of node is a folder which will be converted to a regular node, traverse all of its children and set their parent to the previous nesting level
			if( this_node.type == 1 ) {

				this.detach_children( this_node );

				// Finally, remove the nest wrapper element for the child elements after changing their parent.
				this_node.elements.row.removeChild( this_node.child_div );

				this_node.elements.link.removeAttribute( 'aria-expanded' );

				delete this_node.open;

				// remove open/close event handler, since this is no longer a folder.
				this_node.elements.icon.onclick = '';

				this_node.icon_classes = {
					open: this.settings.file_class,
					closed: this.settings.file_class
				};

			} else {

				var div = document.createElement( 'div' );
				div.className = "nesting";

				var isopen = open || true;

				this_node.open = isopen;
				this_node.children = {};
				this_node.child_div = div; // The reference to the div wrapper for all child elements will be written here
				this_node.elements.row.appendChild( div );


				this_node.elements.link.setAttribute( 'aria-expanded' , isopen );

				// Event handler for opening/closing folder
				this_node.elements.icon.onclick = function() { 

					this.toggle_node( id );

				}.bind(this);

				this_node.icon_classes = {
					open: this.settings.folder_class_open,
					closed: this.settings.folder_class_closed
				};

			}

			// Set the node type
			this_node.type = type;

			// Change the icon class to the new type (default icons;can be replaced later)
			this_node.elements.icon.className = this_node.icon_classes.open;

		},

		 set_icons : function( node , class_open , class_closed ) {

			var id = this.determine_id( node );

			if( this.data[ id ] == undefined ) {

				return false;

			}

			var this_node = this.data[ id ];

			this_node.icon_classes.open = class_open;
			this_node.icon_classes.closed = class_closed || class_open;

			// If the node is a folder, determine if its open or not to use the appropriate icon. Otherwise it doesn't matter which icon is used
			// For independent nodes there is only one icon, which is defined under the class_open parameter. class_closed is optional in this instance
			var class_current = ( this_node.type == 1 ) ? ( this_node.open == true ? this_node.icon_classes.open : this_node.icon_classes.closed ) : this_node.icon_classes.open;

			this_node.elements.icon.className = class_current;

		},

		 

		 hash : function (str) {
				
			var hash = 0;
			if (str.length == 0) { return hash; }
			
			for (i = 0; i < str.length; i++) {
			
				char = str.charCodeAt(i);
				hash = ((hash<<5)-hash)+char;
				hash = hash & hash; // Convert to 32bit integer
				
			}
			
			return hash;
			
		},

		
		 removeSelected : function( type ) {
	 
			var selected = this.getSelected( type );
		 
			if( selected.length == 0 ) {
			
				return false;
				
			}
			
			var sub, parent_name , parent_id , refs;
		 
			for( var i = 0 ; i < selected.length; i++ ) {
				
				parent_name = selected[ i ].innerText.trim();
				parent_id = selected[ i ].parentNode.id;
				
				sub = $( "#" + parent_id );
		
				sub.remove();
				
				add2history( "[" + type + "] removed."  );
		 
			}

		},

		 getSelected : function( type ) {
			
			var aria_row = this.settings.aria_row || "aria-selected";
			
			var result = $( "#"+this.target_id + " div li["+this.settings.aria_row+"=true][dash-type="+type+"]" );
			
			return result;

		},

		 getSelectedName : function( type , which ) {
			
			var selected = this.getSelected( type );
		 
			if( selected.length == 0 ) {
			
				return false;
				
			}
			
			var result = [];
			var limit = selected.length;
			var start = 0;
			
			if( which !== undefined && which > 0 && which <= limit ) {
				
				start = which-1;
				limit = which;
				
			}
			
			for( var i = start ; i < limit ; i++ ) {

				result.push( selected[ i ].innerText.trim() );
				
			}
			
			return result;

		},
		 

		 add : function( type , name , parent , dash_attr , css_class_open , css_class_closed ) {

			var aria_icon = this.settings.aria_icon || "aria-expanded";
			var aria_row = this.settings.aria_row || "aria-selected";
			
			var id = ( type == 1 ) ? "file" : "folder";
			
			// FontAwesome icon classes used when a folder is open or closed. By default these are open/close folder icons, but can be changed to any FontAwesome icon when passed as
			if( type !== 1 ) {
				var icon_class_open = css_class_open || this.settings.folder_class_open;
				var icon_class_closed = css_class_closed || this.settings.folder_class_closed;
			} else {
				var icon_class_file = css_class_open || this.settings.file_class;
			}
			
			
			var row = document.createElement( 'div' );
			 
			var hash = this.hash( name );
			row.setAttribute( 'id' , id + "-" + hash );
			
			var span = document.createElement( 'span' );
			//row.appendChild( span );
			
			var icon = document.createElement( 'a' );
			icon.className = "toggle-icon";
			row.appendChild( icon );
			
			var i = document.createElement( 'i' );
			if( type !== 1 ) {
				i.className = icon_class_open;
				i.setAttribute( aria_icon , "true" );
			} else {
				i.className = icon_class_file;
			}
			icon.appendChild( i );
			
			var li = document.createElement( 'li' );
			if( this.settings.noselect === true ) { 
				li.className = "noselect";
				if( dash_attr !== undefined ) { 
					li.setAttribute( "dash-type" , dash_attr );
				}
			}
			li.setAttribute( aria_row , "false" );
			li.innerHTML = "&nbsp; " + name; 
			row.appendChild( li );
			
			if( type !== 1 ) {
			
			var sub = document.createElement( 'div' );
			sub.setAttribute( "id" , "parent" );
			sub.className = "row-margin";
			row.appendChild( sub );
			
			}
			
			// Clear floats from row
			var clear = document.createElement( 'div' );
			clear.style.clear = "both";
			row.appendChild( clear );
		 
			// Row event handler (select/deselect folder)
			li.onclick = function() {
		 
				var aria = li.getAttribute( aria_row );
		 
				var type = $(li).attr("dash-type");
				
				if( aria == "true" ) {
					
					li.setAttribute( aria_row , "false" );
					li.classList.remove("folder-selected");
				
				} else {
					
					// Deselect all folders first
					if( this.settings.multiselect === false ) {
						
						var rest = $( "#"+this.target_id + " div li" );
						rest.attr( aria_row , "false" );
						rest.removeClass( "folder-selected" );
					
					} else {
						
						var rest = $( "#"+this.target_id + " div li[dash-type!="+type+"]" );
						rest.attr( aria_row , "false" );
						rest.removeClass( "folder-selected" );
						
					}
					
					li.setAttribute( aria_row , "true" );
					li.className += " folder-selected";

				}
		 
				
			}.bind( this );
			
			if( type !== 1 ) {
			
				// Icon event handler (open/close folder)
				i.onclick = function() {
					
					var aria = i.getAttribute( aria_icon );
					
					var delay = this.settings.jquery_transition_delay || 200;
					
					if( aria == "true" ) {
						
						i.setAttribute( aria_icon , "false" );
						i.className = icon_class_closed;
						
						if( this.settings.jquery_animations === true ) {
						
							$( sub ).slideUp( delay );
							
						} else {
						
							sub.style.display = "none";
							
						}
						
					} else {
						
						i.setAttribute( aria_icon , "true" );
						i.className = icon_class_open;
						
						if( this.settings.jquery_animations === true ) {
						
							$( sub ).slideDown( delay );
							
						} else {
						
							sub.style.display = "block";
							
						}
						
					}
			 
				}.bind( this );
			
			}
			
			var target; 
			
			if( parent == 0 || parent == undefined ) {
				
				target = this.target;
				
			} else {
				
				target = parent;
				
			}
			
			$( row ).appendTo( target );
		 
			
			if( type !== 1 ) {
			
				return sub;
			
			}
			
		}

	});

	internal.defineModule( _modname , instance );
 

})( Glacier , Glacier.utils , Glacier.internal );
 