
const { src , dest , series } = require('gulp');
var concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');

const srcDir = "src/";
const distDir = "dist/";

// Compile CSS files
function buildCSS() {

	return src(['src/core/css/_CORE_ALL.scss'])
	  .pipe(concat('glacier.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(dest( distDir ))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest( distDir ));

}

function buildCSSEssentials() {

  return src(['src/core/css/_CORE_ESSENTIALS.scss'])
    .pipe(concat('glacier.essentials.css'))
    .pipe(sass().on('error', sass.logError))
    .pipe(dest( distDir ))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest( distDir ));
  
}


// Compile JS files
function buildJS() {

  return src([ 
       'src/core/js/core.js' , 'src/core/js/polyfills.js', 'src/core/js/utils.js' , 'src/core/js/math.js' , 'src/core/js/compiler.js' ,
       'src/modules/core/*.js', 
       'src/modules/standard/*.js' , 
       'src/modules/custom/*.js'
    ])
  	.pipe(concat('glacier.js'))
    .pipe(dest( distDir ))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest( distDir ));

}

function buildJSEssentials() {

  return src([ 
       'src/core/js/core.js' , 'src/core/js/polyfills.js', 'src/core/js/utils.js' , 'src/core/js/math.js' , 'src/core/js/compiler.js' ,
       'src/modules/core/*.js' 
    ])
    .pipe(concat('glacier.essentials.js'))
    .pipe(dest( distDir ))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest( distDir ));

}


exports.default = series( buildCSS, buildCSSEssentials, buildJS, buildJSEssentials );