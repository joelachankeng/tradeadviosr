const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const environments = require('gulp-environments');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const del = require('del');
const babel = require('gulp-babel');
const inlinesource = require('gulp-inline-source');
const replace = require('gulp-replace');
const browserSync = require('browser-sync').create();
const php = require('gulp-connect-php');
const development = environments.development; // use flag --env development
const production = environments.production; //use flag --env production
const shell = require('shelljs')

const inquirer = require('inquirer');
const yargs = require('yargs');

let command = yargs.argv;
let siteDirectory = ''; 
let browserChoice = 'chrome';

gulp.task('run', function () {
    siteDirectory = command.site;
    if(command.browser != undefined) {
      browserChoice = command.browser;
    }
    
    if(siteDirectory != undefined){
      runSequence('serve');
      runSequence('critical-css');
      runSequence('non-critical-css');
      runSequence('infoscripts');
    }
    else {
      console.log('No site directory chosen.')
    }
    
});

gulp.task('watch', () => {
  if(siteDirectory != undefined){
    //core changes 
    gulp.watch(`./core/**/*`, [ 'critical-css', 'non-critical-css']).on('change', browserSync.reload);

    //css changes
    gulp.watch(`./sites/${siteDirectory}/src/scss/**/*`, [ 'critical-css', 'non-critical-css']).on('change', browserSync.reload);

    //JS changes
    gulp.watch(paths.infoscripts, ['infoscripts']).on('change', browserSync.reload);
    gulp.watch(`./sites/${siteDirectory}/src/js/walden-runner.js`, ['infoscripts']).on('change', browserSync.reload);

    //AMP changes
    gulp.watch(`./sites/${siteDirectory}/amp/src/**/*`, ['ampinfo']).on('change', browserSync.reload);

  }
  else {
    console.log('No site directory chosen.')
  }
      
});

gulp.task('default', ['run', 'watch']);

const paths = {
    infoscripts: [
        './core/js/bootstrap/transition.js',
        './core/js/bootstrap/tab.js',
        './core/js/bootstrap/collapse.js',
        './core/js/vendor/jquery.validate.min.js',
        './core/js/vendor/jquery.magnific-popup.js',
        './core/js/vendor/owl.carousel.min.js',
        './core/js/vendor/jquery-waldheader.js',
        './core/js/vendor/jquery-waldpop.js',
        './core/js/vendor/jquery.matchHeight.js',
        './core/js/vendor/jquery-migrate.min.js',
        './core/js/walden/detectBrowser.js'
    ],
};

/* ==========================================
SASS Processor - for Critical & Noncritical 
=============================================*/
gulp.task('critical-css', () => {
    const postCssOpts = [
      autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
      cssnano,
      // mqpacker
    ];
    return gulp.src(`./sites/${siteDirectory}/src/scss/critical.scss`)
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: ['./core']
      }).on('error', sass.logError))
      .pipe(postcss(postCssOpts))
      .pipe(rename('critical.min.css'))
      .pipe(production(replace('core/images/', 'images/')))
      .pipe(development(sourcemaps.write('.'))) // write sourcemap only when run as development use --env production to run as production to remvoe sourcemap in prod env
      .pipe(development(gulp.dest(`./sites/${siteDirectory}/dist/`)))
          // .pipe(development(gulp.dest('../Front-End/infosite/styles/')))
          .pipe(development(gulp.dest(`./sites/${siteDirectory}/amp/dist/`)))
      .pipe(production(gulp.dest(`./production/${siteDirectory}/`))) // changed to public html
      .pipe(browserSync.stream());
});

gulp.task('non-critical-css', () => {
    const postCssOpts = [
      autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
      cssnano,
      // mqpacker
    ];
    return gulp.src(`./sites/${siteDirectory}/src/scss/non-critical.scss`)
      .pipe(sourcemaps.init())
      .pipe(sass({
        includePaths: ['./core']
      }).on('error', sass.logError))
      .pipe(postcss(postCssOpts))
      .pipe(rename('non-critical.min.css'))
      .pipe(production(replace('core/images/', 'images/')))
      .pipe(development(sourcemaps.write('.')))
      .pipe(development(gulp.dest(`./sites/${siteDirectory}/dist/`)))
    //  .pipe(development(gulp.dest('../Front-End/css/')))
      .pipe(production(gulp.dest(`./production/${siteDirectory}/`)))
      .pipe(browserSync.stream());
  });

/* ==========================================
JS Processor - To Clean JS
=============================================*/
gulp.task('info-minify-scripts', function() {
  paths.infoscripts.push('./sites/'+siteDirectory+'/src/js/walden-runner.js');
    gulp.src(paths.infoscripts)
        //.pipe(plumber(plumberErrorHandler))
				.pipe(sourcemaps.init())
        .pipe(concat('app.js'))
				.pipe(gulp.dest(`./sites/${siteDirectory}/dist/`))
				.pipe(uglify().on('error', function(e) {
            console.log(e);
        }))
        // .pipe(development(sourcemaps.write('.')))
				.pipe(rename(`app.${siteDirectory}.min.js`))
        .pipe(gulp.dest(`./sites/${siteDirectory}/dist/`))
        .pipe(production(gulp.dest(`./production/${siteDirectory}/`)))
        .pipe(browserSync.stream());
});

gulp.task('infoscripts', () => {
    runSequence(
        // 'clean-js',
        'info-minify-scripts'
    );
});

/* ==========================================
AMP'd Tasks - ampd css file generation
=============================================*/
gulp.task('amp-css', function() {

    var postCssOpts = [
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        cssnano
        //mqpacker
    ];
    return gulp.src(`./sites/${siteDirectory}/amp/src/scss/amp-style.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postCssOpts))
        .pipe(rename('amp-style.min.css'))
        .pipe(production(replace('core/images/', 'images/')))
        .pipe(development(sourcemaps.write('.')))
        // .pipe((gulp.dest('../Front-End/infosite/amp/style/')))
				.pipe((gulp.dest(`./sites/${siteDirectory}/amp/dist/`)))
        // .pipe((gulp.dest('../public_html/src/Project/Infosite/code/Styles/Infosite/')))
        .pipe(production(gulp.dest(`./production/${siteDirectory}/`)))
        .pipe(browserSync.stream());
});

// ampd inline css into *amp*.html pages	
gulp.task('inlinesource', function() {
    /*var options = { //https://github.com/popeindustries/inline-source#usage
        attribute: 'amp-custom'
	};
	*/
    //  this will apply any css changes to all amp pages in the directory and rewrite them to the Front-End directory
    return gulp.src(`./sites/${siteDirectory}/amp/src/components/*amp*.html`)//change to amp
        .pipe(inlinesource())
        .pipe(gulp.dest(`./sites/${siteDirectory}/amp/components/`))
        .pipe(browserSync.stream());
});

// ampd sequencer
gulp.task('ampinfo', () => {
    runSequence(
        //'clean-js',
        'amp-css',
        'inlinesource'
    );
});


gulp.task('serve', function() {
  shell.exec(`node runserver.js --site=${siteDirectory}`, { async: true });
  browserSync.init({
    proxy:"127.0.0.1:8080",
    port: 8080,
    baseDir:`./sites/${siteDirectory}`,
    open:true,
    notify:false,
    browser: `${browserChoice}`,
  });
  
  gulp.watch( `./sites/${siteDirectory}/*.php`).on('change', browserSync.reload);

});