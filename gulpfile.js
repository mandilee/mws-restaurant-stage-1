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
    console.log('help');
});

gulp.task('cleanup', function() {
    del(['./css/**']);

});
