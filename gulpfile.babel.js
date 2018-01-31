// Gulp task runner for whole project.

import gulp from 'gulp';
import eslint from 'gulp-eslint';
import nodemon from 'gulp-nodemon';
import colors from 'ansi-colors';

/* Can be used to log events from server with colors using events emitted by nodemon.*/
function onServerLog(log) {
    console.log(colors.white('[') +
        colors.yellow('nodemon') +
        colors.white('] ') +
        log.message);
}

gulp.task('lint:server', () => {
    return gulp.src(['**/*.js', '!node_modules/**', '!angular-src/**'])
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError());
});

gulp.task('start:server', () => {
    let stream = nodemon({
	script: 'server/index.js',
	ext: 'js json',
	watch: [
	    'server/'
	],
	env: {
	    'NODE_ENV': 'development'
	}
    });

    stream
	.on('restart', (files) => {
	    onServerLog('Server restarted', files);	    
	})
});

gulp.task('default', () => {
    gulp.watch(['**/*.js', '!node_modules/**', '!angular-src/**'], ['lint'])
});
