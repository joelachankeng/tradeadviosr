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
// const del = require('del');
// const babel = require('gulp-babel');
// const inlinesource = require('gulp-inline-source');
// const replace = require('gulp-replace');
const browserSync = require('browser-sync').create();
// const php = require('gulp-connect-php');
const development = environments.development; // use flag --env development
const production = environments.production; //use flag --env production

gulp.task('run', function () {
 
    runSequence('serve');
    runSequence('css');
    runSequence('scripts');
  
});

gulp.task('watch', () => {

    //css changes
    gulp.watch(`./src/scss/**/*`, [ 'css']).on('change', browserSync.reload);

    //JS changes
    gulp.watch(paths.scripts, ['scripts']).on('change', browserSync.reload);
    gulp.watch(`./src/js/main.js`, ['scripts']).on('change', browserSync.reload);
 
});

gulp.task('default', ['run', 'watch']);

const paths = {
  infoscripts: [
    './src/js/vendor/jquery-3.4.1.slim.min.js',
    './src/js/vendor/bootstrap.min.js',
    './src/js/vendor/popper.min.js',
  ],
};

gulp.task('css', () => {
  const postCssOpts = [
    autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
    cssnano,
    // mqpacker
  ];
  return gulp.src(`./src/scss/main.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postCssOpts))
    .pipe(rename('styles.min.css'))
    .pipe(development(sourcemaps.write('.'))) 
    .pipe(development(gulp.dest(`./dist/`)))
    .pipe(production(gulp.dest(`./dist/`))) 
    .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  paths.infoscripts.push('./src/js/main.js');
    gulp.src(paths.infoscripts)
      .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      .pipe(gulp.dest(`./dist/`))
      .pipe(uglify().on('error', function(e) {
          console.log(e);
      }))
      .pipe(rename(`app.min.js`))
      .pipe(gulp.dest(`./dist/`))
      .pipe(production(gulp.dest(`./dist/`)))
      .pipe(browserSync.stream());
});

gulp.task('serve', function() {
  browserSync.init({
    server: {
        baseDir: "./",
        index: "index.html"
    }
});
  
  gulp.watch( `./*.html`).on('change', browserSync.reload);

});