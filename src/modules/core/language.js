(function( _core , utils , internal ) {

	//"use strict";
 

	/**
	 * @author Phil Teare
	 * using wikipedia data
	 */
	var isoLangs = {
	    "ab":{
	        "name":"Abkhaz",
	        "nativeName":"аҧсуа"
	    },
	    "aa":{
	        "name":"Afar",
	        "nativeName":"Afaraf"
	    },
	    "af":{
	        "name":"Afrikaans",
	        "nativeName":"Afrikaans"
	    },
	    "ak":{
	        "name":"Akan",
	        "nativeName":"Akan"
	    },
	    "sq":{
	        "name":"Albanian",
	        "nativeName":"Shqip"
	    },
	    "am":{
	        "name":"Amharic",
	        "nativeName":"አማርኛ"
	    },
	    "ar":{
	        "name":"Arabic",
	        "nativeName":"العربية"
	    },
	    "an":{
	        "name":"Aragonese",
	        "nativeName":"Aragonés"
	    },
	    "hy":{
	        "name":"Armenian",
	        "nativeName":"Հայերեն"
	    },
	    "as":{
	        "name":"Assamese",
	        "nativeName":"অসমীয়া"
	    },
	    "av":{
	        "name":"Avaric",
	        "nativeName":"авар мацӀ, магӀарул мацӀ"
	    },
	    "ae":{
	        "name":"Avestan",
	        "nativeName":"avesta"
	    },
	    "ay":{
	        "name":"Aymara",
	        "nativeName":"aymar aru"
	    },
	    "az":{
	        "name":"Azerbaijani",
	        "nativeName":"azərbaycan dili"
	    },
	    "bm":{
	        "name":"Bambara",
	        "nativeName":"bamanankan"
	    },
	    "ba":{
	        "name":"Bashkir",
	        "nativeName":"башҡорт теле"
	    },
	    "eu":{
	        "name":"Basque",
	        "nativeName":"euskara, euskera"
	    },
	    "be":{
	        "name":"Belarusian",
	        "nativeName":"Беларуская"
	    },
	    "bn":{
	        "name":"Bengali",
	        "nativeName":"বাংলা"
	    },
	    "bh":{
	        "name":"Bihari",
	        "nativeName":"भोजपुरी"
	    },
	    "bi":{
	        "name":"Bislama",
	        "nativeName":"Bislama"
	    },
	    "bs":{
	        "name":"Bosnian",
	        "nativeName":"bosanski jezik"
	    },
	    "br":{
	        "name":"Breton",
	        "nativeName":"brezhoneg"
	    },
	    "bg":{
	        "name":"Bulgarian",
	        "nativeName":"български език"
	    },
	    "my":{
	        "name":"Burmese",
	        "nativeName":"ဗမာစာ"
	    },
	    "ca":{
	        "name":"Catalan; Valencian",
	        "nativeName":"Català"
	    },
	    "ch":{
	        "name":"Chamorro",
	        "nativeName":"Chamoru"
	    },
	    "ce":{
	        "name":"Chechen",
	        "nativeName":"нохчийн мотт"
	    },
	    "ny":{
	        "name":"Chichewa; Chewa; Nyanja",
	        "nativeName":"chiCheŵa, chinyanja"
	    },
	    "zh":{
	        "name":"Chinese",
	        "nativeName":"中文 (Zhōngwén), 汉语, 漢語"
	    },
	    "cv":{
	        "name":"Chuvash",
	        "nativeName":"чӑваш чӗлхи"
	    },
	    "kw":{
	        "name":"Cornish",
	        "nativeName":"Kernewek"
	    },
	    "co":{
	        "name":"Corsican",
	        "nativeName":"corsu, lingua corsa"
	    },
	    "cr":{
	        "name":"Cree",
	        "nativeName":"ᓀᐦᐃᔭᐍᐏᐣ"
	    },
	    "hr":{
	        "name":"Croatian",
	        "nativeName":"hrvatski"
	    },
	    "cs":{
	        "name":"Czech",
	        "nativeName":"česky, čeština"
	    },
	    "da":{
	        "name":"Danish",
	        "nativeName":"dansk"
	    },
	    "dv":{
	        "name":"Divehi; Dhivehi; Maldivian;",
	        "nativeName":"ދިވެހި"
	    },
	    "nl":{
	        "name":"Dutch",
	        "nativeName":"Nederlands, Vlaams"
	    },
	    "en":{
	        "name":"English",
	        "nativeName":"English"
	    },
	    "eo":{
	        "name":"Esperanto",
	        "nativeName":"Esperanto"
	    },
	    "et":{
	        "name":"Estonian",
	        "nativeName":"eesti, eesti keel"
	    },
	    "ee":{
	        "name":"Ewe",
	        "nativeName":"Eʋegbe"
	    },
	    "fo":{
	        "name":"Faroese",
	        "nativeName":"føroyskt"
	    },
	    "fj":{
	        "name":"Fijian",
	        "nativeName":"vosa Vakaviti"
	    },
	    "fi":{
	        "name":"Finnish",
	        "nativeName":"suomi, suomen kieli"
	    },
	    "fr":{
	        "name":"French",
	        "nativeName":"français, langue française"
	    },
	    "ff":{
	        "name":"Fula; Fulah; Pulaar; Pular",
	        "nativeName":"Fulfulde, Pulaar, Pular"
	    },
	    "gl":{
	        "name":"Galician",
	        "nativeName":"Galego"
	    },
	    "ka":{
	        "name":"Georgian",
	        "nativeName":"ქართული"
	    },
	    "de":{
	        "name":"German",
	        "nativeName":"Deutsch"
	    },
	    "el":{
	        "name":"Greek, Modern",
	        "nativeName":"Ελληνικά"
	    },
	    "gn":{
	        "name":"Guaraní",
	        "nativeName":"Avañeẽ"
	    },
	    "gu":{
	        "name":"Gujarati",
	        "nativeName":"ગુજરાતી"
	    },
	    "ht":{
	        "name":"Haitian; Haitian Creole",
	        "nativeName":"Kreyòl ayisyen"
	    },
	    "ha":{
	        "name":"Hausa",
	        "nativeName":"Hausa, هَوُسَ"
	    },
	    "he":{
	        "name":"Hebrew (modern)",
	        "nativeName":"עברית"
	    },
	    "hz":{
	        "name":"Herero",
	        "nativeName":"Otjiherero"
	    },
	    "hi":{
	        "name":"Hindi",
	        "nativeName":"हिन्दी, हिंदी"
	    },
	    "ho":{
	        "name":"Hiri Motu",
	        "nativeName":"Hiri Motu"
	    },
	    "hu":{
	        "name":"Hungarian",
	        "nativeName":"Magyar"
	    },
	    "ia":{
	        "name":"Interlingua",
	        "nativeName":"Interlingua"
	    },
	    "id":{
	        "name":"Indonesian",
	        "nativeName":"Bahasa Indonesia"
	    },
	    "ie":{
	        "name":"Interlingue",
	        "nativeName":"Originally called Occidental; then Interlingue after WWII"
	    },
	    "ga":{
	        "name":"Irish",
	        "nativeName":"Gaeilge"
	    },
	    "ig":{
	        "name":"Igbo",
	        "nativeName":"Asụsụ Igbo"
	    },
	    "ik":{
	        "name":"Inupiaq",
	        "nativeName":"Iñupiaq, Iñupiatun"
	    },
	    "io":{
	        "name":"Ido",
	        "nativeName":"Ido"
	    },
	    "is":{
	        "name":"Icelandic",
	        "nativeName":"Íslenska"
	    },
	    "it":{
	        "name":"Italian",
	        "nativeName":"Italiano"
	    },
	    "iu":{
	        "name":"Inuktitut",
	        "nativeName":"ᐃᓄᒃᑎᑐᑦ"
	    },
	    "ja":{
	        "name":"Japanese",
	        "nativeName":"日本語 (にほんご／にっぽんご)"
	    },
	    "jv":{
	        "name":"Javanese",
	        "nativeName":"basa Jawa"
	    },
	    "kl":{
	        "name":"Kalaallisut, Greenlandic",
	        "nativeName":"kalaallisut, kalaallit oqaasii"
	    },
	    "kn":{
	        "name":"Kannada",
	        "nativeName":"ಕನ್ನಡ"
	    },
	    "kr":{
	        "name":"Kanuri",
	        "nativeName":"Kanuri"
	    },
	    "ks":{
	        "name":"Kashmiri",
	        "nativeName":"कश्मीरी, كشميري‎"
	    },
	    "kk":{
	        "name":"Kazakh",
	        "nativeName":"Қазақ тілі"
	    },
	    "km":{
	        "name":"Khmer",
	        "nativeName":"ភាសាខ្មែរ"
	    },
	    "ki":{
	        "name":"Kikuyu, Gikuyu",
	        "nativeName":"Gĩkũyũ"
	    },
	    "rw":{
	        "name":"Kinyarwanda",
	        "nativeName":"Ikinyarwanda"
	    },
	    "ky":{
	        "name":"Kirghiz, Kyrgyz",
	        "nativeName":"кыргыз тили"
	    },
	    "kv":{
	        "name":"Komi",
	        "nativeName":"коми кыв"
	    },
	    "kg":{
	        "name":"Kongo",
	        "nativeName":"KiKongo"
	    },
	    "ko":{
	        "name":"Korean",
	        "nativeName":"한국어 (韓國語), 조선말 (朝鮮語)"
	    },
	    "ku":{
	        "name":"Kurdish",
	        "nativeName":"Kurdî, كوردی‎"
	    },
	    "kj":{
	        "name":"Kwanyama, Kuanyama",
	        "nativeName":"Kuanyama"
	    },
	    "la":{
	        "name":"Latin",
	        "nativeName":"latine, lingua latina"
	    },
	    "lb":{
	        "name":"Luxembourgish, Letzeburgesch",
	        "nativeName":"Lëtzebuergesch"
	    },
	    "lg":{
	        "name":"Luganda",
	        "nativeName":"Luganda"
	    },
	    "li":{
	        "name":"Limburgish, Limburgan, Limburger",
	        "nativeName":"Limburgs"
	    },
	    "ln":{
	        "name":"Lingala",
	        "nativeName":"Lingála"
	    },
	    "lo":{
	        "name":"Lao",
	        "nativeName":"ພາສາລາວ"
	    },
	    "lt":{
	        "name":"Lithuanian",
	        "nativeName":"lietuvių kalba"
	    },
	    "lu":{
	        "name":"Luba-Katanga",
	        "nativeName":""
	    },
	    "lv":{
	        "name":"Latvian",
	        "nativeName":"latviešu valoda"
	    },
	    "gv":{
	        "name":"Manx",
	        "nativeName":"Gaelg, Gailck"
	    },
	    "mk":{
	        "name":"Macedonian",
	        "nativeName":"македонски јазик"
	    },
	    "mg":{
	        "name":"Malagasy",
	        "nativeName":"Malagasy fiteny"
	    },
	    "ms":{
	        "name":"Malay",
	        "nativeName":"bahasa Melayu, بهاس ملايو‎"
	    },
	    "ml":{
	        "name":"Malayalam",
	        "nativeName":"മലയാളം"
	    },
	    "mt":{
	        "name":"Maltese",
	        "nativeName":"Malti"
	    },
	    "mi":{
	        "name":"Māori",
	        "nativeName":"te reo Māori"
	    },
	    "mr":{
	        "name":"Marathi (Marāṭhī)",
	        "nativeName":"मराठी"
	    },
	    "mh":{
	        "name":"Marshallese",
	        "nativeName":"Kajin M̧ajeļ"
	    },
	    "mn":{
	        "name":"Mongolian",
	        "nativeName":"монгол"
	    },
	    "na":{
	        "name":"Nauru",
	        "nativeName":"Ekakairũ Naoero"
	    },
	    "nv":{
	        "name":"Navajo, Navaho",
	        "nativeName":"Diné bizaad, Dinékʼehǰí"
	    },
	    "nb":{
	        "name":"Norwegian Bokmål",
	        "nativeName":"Norsk bokmål"
	    },
	    "nd":{
	        "name":"North Ndebele",
	        "nativeName":"isiNdebele"
	    },
	    "ne":{
	        "name":"Nepali",
	        "nativeName":"नेपाली"
	    },
	    "ng":{
	        "name":"Ndonga",
	        "nativeName":"Owambo"
	    },
	    "nn":{
	        "name":"Norwegian Nynorsk",
	        "nativeName":"Norsk nynorsk"
	    },
	    "no":{
	        "name":"Norwegian",
	        "nativeName":"Norsk"
	    },
	    "ii":{
	        "name":"Nuosu",
	        "nativeName":"ꆈꌠ꒿ Nuosuhxop"
	    },
	    "nr":{
	        "name":"South Ndebele",
	        "nativeName":"isiNdebele"
	    },
	    "oc":{
	        "name":"Occitan",
	        "nativeName":"Occitan"
	    },
	    "oj":{
	        "name":"Ojibwe, Ojibwa",
	        "nativeName":"ᐊᓂᔑᓈᐯᒧᐎᓐ"
	    },
	    "cu":{
	        "name":"Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",
	        "nativeName":"ѩзыкъ словѣньскъ"
	    },
	    "om":{
	        "name":"Oromo",
	        "nativeName":"Afaan Oromoo"
	    },
	    "or":{
	        "name":"Oriya",
	        "nativeName":"ଓଡ଼ିଆ"
	    },
	    "os":{
	        "name":"Ossetian, Ossetic",
	        "nativeName":"ирон æвзаг"
	    },
	    "pa":{
	        "name":"Panjabi, Punjabi",
	        "nativeName":"ਪੰਜਾਬੀ, پنجابی‎"
	    },
	    "pi":{
	        "name":"Pāli",
	        "nativeName":"पाऴि"
	    },
	    "fa":{
	        "name":"Persian",
	        "nativeName":"فارسی"
	    },
	    "pl":{
	        "name":"Polish",
	        "nativeName":"polski"
	    },
	    "ps":{
	        "name":"Pashto, Pushto",
	        "nativeName":"پښتو"
	    },
	    "pt":{
	        "name":"Portuguese",
	        "nativeName":"Português"
	    },
	    "qu":{
	        "name":"Quechua",
	        "nativeName":"Runa Simi, Kichwa"
	    },
	    "rm":{
	        "name":"Romansh",
	        "nativeName":"rumantsch grischun"
	    },
	    "rn":{
	        "name":"Kirundi",
	        "nativeName":"kiRundi"
	    },
	    "ro":{
	        "name":"Romanian, Moldavian, Moldovan",
	        "nativeName":"română"
	    },
	    "ru":{
	        "name":"Russian",
	        "nativeName":"русский язык"
	    },
	    "sa":{
	        "name":"Sanskrit (Saṁskṛta)",
	        "nativeName":"संस्कृतम्"
	    },
	    "sc":{
	        "name":"Sardinian",
	        "nativeName":"sardu"
	    },
	    "sd":{
	        "name":"Sindhi",
	        "nativeName":"सिन्धी, سنڌي، سندھی‎"
	    },
	    "se":{
	        "name":"Northern Sami",
	        "nativeName":"Davvisámegiella"
	    },
	    "sm":{
	        "name":"Samoan",
	        "nativeName":"gagana faa Samoa"
	    },
	    "sg":{
	        "name":"Sango",
	        "nativeName":"yângâ tî sängö"
	    },
	    "sr":{
	        "name":"Serbian",
	        "nativeName":"српски језик"
	    },
	    "gd":{
	        "name":"Scottish Gaelic; Gaelic",
	        "nativeName":"Gàidhlig"
	    },
	    "sn":{
	        "name":"Shona",
	        "nativeName":"chiShona"
	    },
	    "si":{
	        "name":"Sinhala, Sinhalese",
	        "nativeName":"සිංහල"
	    },
	    "sk":{
	        "name":"Slovak",
	        "nativeName":"slovenčina"
	    },
	    "sl":{
	        "name":"Slovene",
	        "nativeName":"slovenščina"
	    },
	    "so":{
	        "name":"Somali",
	        "nativeName":"Soomaaliga, af Soomaali"
	    },
	    "st":{
	        "name":"Southern Sotho",
	        "nativeName":"Sesotho"
	    },
	    "es":{
	        "name":"Spanish; Castilian",
	        "nativeName":"español, castellano"
	    },
	    "su":{
	        "name":"Sundanese",
	        "nativeName":"Basa Sunda"
	    },
	    "sw":{
	        "name":"Swahili",
	        "nativeName":"Kiswahili"
	    },
	    "ss":{
	        "name":"Swati",
	        "nativeName":"SiSwati"
	    },
	    "sv":{
	        "name":"Swedish",
	        "nativeName":"svenska"
	    },
	    "ta":{
	        "name":"Tamil",
	        "nativeName":"தமிழ்"
	    },
	    "te":{
	        "name":"Telugu",
	        "nativeName":"తెలుగు"
	    },
	    "tg":{
	        "name":"Tajik",
	        "nativeName":"тоҷикӣ, toğikī, تاجیکی‎"
	    },
	    "th":{
	        "name":"Thai",
	        "nativeName":"ไทย"
	    },
	    "ti":{
	        "name":"Tigrinya",
	        "nativeName":"ትግርኛ"
	    },
	    "bo":{
	        "name":"Tibetan Standard, Tibetan, Central",
	        "nativeName":"བོད་ཡིག"
	    },
	    "tk":{
	        "name":"Turkmen",
	        "nativeName":"Türkmen, Түркмен"
	    },
	    "tl":{
	        "name":"Tagalog",
	        "nativeName":"Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔"
	    },
	    "tn":{
	        "name":"Tswana",
	        "nativeName":"Setswana"
	    },
	    "to":{
	        "name":"Tonga (Tonga Islands)",
	        "nativeName":"faka Tonga"
	    },
	    "tr":{
	        "name":"Turkish",
	        "nativeName":"Türkçe"
	    },
	    "ts":{
	        "name":"Tsonga",
	        "nativeName":"Xitsonga"
	    },
	    "tt":{
	        "name":"Tatar",
	        "nativeName":"татарча, tatarça, تاتارچا‎"
	    },
	    "tw":{
	        "name":"Twi",
	        "nativeName":"Twi"
	    },
	    "ty":{
	        "name":"Tahitian",
	        "nativeName":"Reo Tahiti"
	    },
	    "ug":{
	        "name":"Uighur, Uyghur",
	        "nativeName":"Uyƣurqə, ئۇيغۇرچە‎"
	    },
	    "uk":{
	        "name":"Ukrainian",
	        "nativeName":"українська"
	    },
	    "ur":{
	        "name":"Urdu",
	        "nativeName":"اردو"
	    },
	    "uz":{
	        "name":"Uzbek",
	        "nativeName":"zbek, Ўзбек, أۇزبېك‎"
	    },
	    "ve":{
	        "name":"Venda",
	        "nativeName":"Tshivenḓa"
	    },
	    "vi":{
	        "name":"Vietnamese",
	        "nativeName":"Tiếng Việt"
	    },
	    "vo":{
	        "name":"Volapük",
	        "nativeName":"Volapük"
	    },
	    "wa":{
	        "name":"Walloon",
	        "nativeName":"Walon"
	    },
	    "cy":{
	        "name":"Welsh",
	        "nativeName":"Cymraeg"
	    },
	    "wo":{
	        "name":"Wolof",
	        "nativeName":"Wollof"
	    },
	    "fy":{
	        "name":"Western Frisian",
	        "nativeName":"Frysk"
	    },
	    "xh":{
	        "name":"Xhosa",
	        "nativeName":"isiXhosa"
	    },
	    "yi":{
	        "name":"Yiddish",
	        "nativeName":"ייִדיש"
	    },
	    "yo":{
	        "name":"Yoruba",
	        "nativeName":"Yorùbá"
	    },
	    "za":{
	        "name":"Zhuang, Chuang",
	        "nativeName":"Saɯ cueŋƅ, Saw cuengh"
	    }
	};



	var _defaultTag = internal.prefix() + "var";
	var _modname = "language";

	var instance = function( target , options , events ) {

		this.target = typeof target == 'string' ? $( target ) : target;
		this.cfg = this.defaultOptions();
		utils.applyProperties( this.cfg , options );
		this.events = {
			onLanguageSet: false,
			onVariableSet: false
		};
		utils.applyProperties( this.events , events );
		this.data = {};
		this.current = false;
		this.vars = {};
		this.getVars();

	}

	Object.assign( instance.prototype , {

		defaultOptions: function() {
			
			return {
				animation: true,
				animationType: "fadeIn",
				animationSpeed: "5000",
				cloneData: false,
				variableTag: _defaultTag
			};
		
		},

		setAnimation: function( v ) {
			this.cfg.animation = v == true ? true : false;
		},

		languageExists: function( name ) {

			if( this.data[name] == undefined ) { return false; }
			return true;

		},

		activeLanguageExists: function() {

			if( this.active == false || this.data[ this.active ] == undefined ) { return false; }
			return true;

		},

		addLanguage: function( name , data ) {

			if( this.languageExists(name) ) { return false; }

			this.data[name] = this.cfg.cloneData == true ? JSON.parse( JSON.stringify( data ) ) : data;
			return true;

		},

		addLanguages: function( data ) {

			for( var i in data ) {
				this.addLanguage( i , data[i] );
			}
		},

		removeLanguage: function( name , data ) {

			if( !this.languageExists(name) ) { return false; }

			delete this.data[name];

			if( this.active === name ) {
				this.active = false;

			}

			return true;

		},

		setLanguage: function( name ) {

			if( !this.languageExists(name) ) { return false; }
			if( this.active == name ) { return false; }
			// Set active language
			this.active = name;
			// Update screen
			this.setVars();

			var onSet = this.events["onLanguageSet"];
			if( onSet !== undefined && typeof onSet == "function" ) {
				onSet( name );
			}

		},

		getVars: function() {
			
			var tag = this.cfg.variableTag;
			var list = this.target.find( tag );
			// If the list is empty or the active language is out of bounds
			if( list.length <= 0 ) { return false; }

			this.vars = {}; 

			list.each( function( id ) {

				var el = $(list[id]);

				var txt = el.html();
				var name = el.attr("name").trim();

				this.vars[name] = el;

			}.bind(this) );

		},

		_propertyRecursive: function ( o , str , cur , lim ) {
  
			var res = o;
			for( var n = cur; n < lim; n++ ) {
			  
				if( res[ str[n] ] == undefined ) { return false; }
				res = res[ str[n] ];
			  

			}
			return res;
		  
		},

		setVars: function() {

			// Recursive
			 

			var n = Object.keys( this.vars ).length;
			if( n <= 0 || !this.activeLanguageExists() ) { return false; }

			var ld = this.data[ this.active ];
			var el,c,ref;
			for( var p in this.vars ) {

				el = this.vars[p];

				// Added support for multi-nested objects. E.g. "lang.level1.level2.property" is acceptable
				c = p.split(".");
				// But not only nested. Sometimes the first level is sufficient. Therefore we need to make that distinction
				ref = c.length <= 1 ? ld[ c[0] ] : this._propertyRecursive( ld , c , 0 , c.length );
				 
				// If this property is not defined in the language pack selected, skip this element
				if( ref == undefined || ref == false ) { continue; }
				
				var tempRef = ref;
				if( this.events["onVariableSet"] !== undefined && typeof this.events["onVariableSet"] == "function" ) {
					ref = this.events["onVariableSet"]( this.active , p , ref , el );
				}
				if( ref == undefined ) { ref = tempRef; }

				// Update property
				if( this.cfg.animation == true ) {
					el.hide().html( ref )[ this.cfg.animationType ]( this.cfg.animationSpeed );
				} else { 
					el.html(ref);
				}
			}

		},

		detectBrowserLanguage: function() {
 
			return navigator.language || navigator.userLanguage; 

		},

		setLanguageAutomatically: function() {

			var bl = this.detectBrowserLanguage();

			return this.setLanguageClosest( bl );

		},

		setLanguageClosest: function( bl ) {

			// If the browser's language exists in the loaded language packs, set it as the current language
			if( this.data[ bl ] !== undefined ) {

				this.setLanguage(bl);
				return true;

			} 
			// Otherwise attempt to find some close relatives
			else {
				 
				// First try to find a Latin or Native spelling of the full language name based on the ISO-639-1 code
				var found = isoLangs[bl];
				if( found !== undefined ) {

					// Check the latin spelling first
					var latin = this.languageExists( found.name );
					if( latin ) { this.setLanguage( found.name ); return true; }
					// Then check the native spelling(s). In some cases there is more than one spelling separated by comma.
					var nts = found.nativeName.split(",");
					for( var i = 0 ; i < nts.length; i++ ) { 
						var ntn = nts[i].trim();
						var native = this.languageExists( ntn );
						if( native ) { this.setLanguage( ntn ); return true; }
					}
				} 
				// Otherwise attempt to split the string and see if the first part of the language code can be found in the language packs (e.g. "en-US" can be shown if there is only "en" available)
				else {

					bl = bl.split("-");

					if( bl.length <= 0 || bl[0].length <= 0 ) { return false; }

					if( this.data[ bl[0] ] !== undefined ) {

						this.setLanguage(bl[0]);
						return true;

					}

				}
				 
			}

			return false;
			
		}

	} );

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );

 