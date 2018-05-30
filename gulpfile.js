var gulp = require('gulp'),
    del = require('del'),
    sass = require('gulp-sass'),
    cleanCss = require('gulp-clean-css'),
    concat = require('gulp-concat')
    ;

gulp.task('default', function () {
    console.log('eh?');
});


gulp.task('styles', function () {
    del(['./css/**']);

    gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('all.css'))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('css'));
});


gulp.task('scripts', function () {
    del(['./js/**']);

    gulp.src(['scripts/**/*.js', '!scripts/restaurant_info.js'])
        .pipe(concat('all_index.js'))
          .pipe(gulp.dest('js'));

    gulp.src(['scripts/**/*.js', '!scripts/main.js'])
        .pipe(concat('all_restaurant.js'))
          .pipe(gulp.dest('js'));
});




gulp.task('cleanup', function() {
    del(['./css/**']);
    del(['./js/**']);

});
