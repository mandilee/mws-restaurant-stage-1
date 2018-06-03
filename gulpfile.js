const SOURCE_JS = 'dev/js',
    SOURCE_SCSS = 'dev/sass',
    SOURCE_IMG = 'dev/img',
    DEST_JS = 'js',
    DEST_CSS = 'css',
    DEST_IMG = 'img';



var gulp = require('gulp'),
    del = require('del'),
    sass = require('gulp-sass'),
    cleanCss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    jimp = require('gulp-jimp-resize'),
    webp = require('gulp-webp'),
    webserver = require('gulp-webserver'),
    uglify = require('gulp-uglify-es').default;


gulp.task('default', function () {
    console.log('eh?');
});


/* combine and compress CSS */
gulp.task('styles', function () {
    del([`${DEST_CSS}/**`]);

    gulp.src(`${SOURCE_SCSS}/**/*.scss`)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('all.css'))
        .pipe(cleanCss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(DEST_CSS));
});


/* combine javascript files - one for each page since they */
gulp.task('scripts', function () {
    del([`${DEST_JS}/**`]);

    gulp.src([`${SOURCE_JS}/**/*.js`, `!${SOURCE_JS}/restaurant_info.js`])
        .pipe(uglify())
        .pipe(concat('all_index.js'))
        .pipe(gulp.dest(DEST_JS));

    gulp.src([`${SOURCE_JS}/**/*.js`, `!${SOURCE_JS}/main.js`])
        .pipe(uglify())
        .pipe(concat('all_restaurant.js'))
        .pipe(gulp.dest(DEST_JS));
});


/* resize images */
gulp.task('resize_images', function () {
    del([`${DEST_IMG}/*.jpg]`]);

    return gulp.src(`${SOURCE_IMG}/*.jpg`)
        .pipe(imagemin())
        .pipe(gulp.dest(DEST_IMG))
        .pipe(jimp({
            sizes: [
                {"suffix": "md", "width": 600},
                {"suffix": "sm", "width": 300}
            ]
        }))
        .pipe(gulp.dest(DEST_IMG));

});

/* save images as webp */
gulp.task('webp_images', ['resize_images'], function () {
    del([`${DEST_IMG}/*.webp]`]);

    return gulp.src(`${DEST_IMG}/*.jpg`)
        .pipe(webp())
        .pipe(gulp.dest(DEST_IMG));
});

gulp.task('images', ['resize_images', 'webp_images']);


/* cleanup before comitting changes! */
gulp.task('cleanup', function () {
    del([`${DEST_CSS}/**`]);
    del([`${DEST_JS}/**`]);
    del([`${DEST_IMG}/**`]);

});



gulp.task('build', ['styles', 'scripts', 'images']);


gulp.task('serve', function() {
  gulp.src('./')
    .pipe(webserver({
      port: 8000,
    }));

});
