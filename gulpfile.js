"use strict";

var gulp = require('gulp');
var gulpMocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var fileList = ['./lib/**/*.js',
    './test/**/*.js',
    './bin/**/*.js',
    './*.js'];


gulp.task('jshint', function () {
    return gulp.src(fileList)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('mocha', function () {
    return gulp.src(fileList)
        .pipe(gulpMocha({reporter: 'nyan'}));
});

gulp.task('default', ['jshint', 'mocha']);