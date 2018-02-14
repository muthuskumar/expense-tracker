// Gulp task runner for whole project.

import gulp from 'gulp';
import del from 'del';
import colors from 'ansi-colors';
import uglify from 'gulp-uglify';
import eslint from 'gulp-eslint';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';

const dist = 'dist';
const serverPath = 'server';
const paths = {
    server: {
	test: {
	    unit: [`${serverPath}/**/*.spec.js`]
	}
    }
}

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

gulp.task('test:server', () => {
    return gulp.src(paths.server.test.unit)
	.pipe(mocha({
	    ui: 'bdd',
	    reporter: 'spec',
	    timeout: 5000,
	    require: [
		'babel-core/register',
		'./mocha.conf'
	    ]
	}))
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

