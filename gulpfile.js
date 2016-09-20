var gulp = require('gulp'),
    shell = require('gulp-shell'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    runSequence = require('run-sequence');

var options = require('minimist')(process.argv.slice(2));

gulp.task('default', function() {
    //run a sequence of tasks
});

gulp.task('extract', shell.task( [
        ("node src/index.js")
    ])
);

gulp.task('jshint-client', function () {
	return gulp.src(['./src/sys_ui_script/*.js', './src/sys_script/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint-server', function () {
	return gulp.src('./src/sys_script_include/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task('jshint', function (callback) {
	/**
	 * This will run in this order: 
	 * jshint-client 
	 * jshint-client and jshint-server in parallel 
	 * jshint-server 
	 * Finally call the callback function
	 */
  	runSequence('jshint-client',
				//['jshint-client', 'jshint-server'],
				'jshint-server',
				callback);
})