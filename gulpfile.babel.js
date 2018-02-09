// Gulp task runner for whole project.

import gulp from 'gulp';
import eslint from 'gulp-eslint';
import nodemon from 'gulp-nodemon';
import colors from 'ansi-colors';
import babel from 'gulp-babel';
import del from 'del';
import uglify from 'gulp-uglify';

const dist = 'dist';
const serverPath = 'server';

/* Can be used to log events from server with colors using events emitted by nodemon.*/
function onServerLog(log) {
    console.log(colors.white('[') +
        colors.yellow('nodemon') +
        colors.white('] ') +
        log.message);
}

function clean() {
    return del([`${dist}\${serverPath}`]);
}

gulp.task('clean:server', gulp.series(clean));

gulp.task('lint:server', () => {
    return gulp.src([`${serverPath}/*.js`])
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError());
});

gulp.task('build:server', () => {
    return gulp.src([`${serverPath}/*.js`])
	.pipe(babel())
	.pipe(uglify())
	.pipe(gulp.dest(`${dist}/${serverPath}`))
});

gulp.task('cleanbuild:server', gulp.series('clean:server', 'lint:server', 'build:server'));

gulp.task('start:server', () => {
    let stream = nodemon({
	script: `${serverPath}/index.js`,
	ext: 'js json',
	watch: [
	    `${serverPath}/`
	],
	env: {
	    'NODE_ENV': 'development'
	},
	tasks: [
	    'lint:server'
	]
    });

    stream
	.on('restart', (files) => {
	    onServerLog('Server restarted', files);	    
	})
});

