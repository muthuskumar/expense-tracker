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
	    unit: [`${serverPath}/**/*.spec.js`],
	    integration: [`${serverPath}/**/*.integration.js`]
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

gulp.task('set-test-node-env', function(done) {
    process.env.NODE_ENV = 'test';
    done();
});

gulp.task('clean:server', gulp.series(clean));

gulp.task('lint:server', () => {
    return gulp.src([`${serverPath}/*.js`])
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError());
});

gulp.task('lint:server:testcases', () => {
    return gulp.src(paths.server.test.unit)
	.pipe(eslint({
	    configFile: './.eslintrc.json',
	    envs: [
		'node',
		'es6',
		'mocha'
	    ]
	}))
	.pipe(eslint.format())
	.pipe(eslint.failAfterError());
});

gulp.task('unit-test:server', () => {
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
	.on('error', (err) => {
	    console.log('An error occurred');
	});
});

gulp.task('integrate-test:server', () => {
    return gulp.src(paths.server.test.integration)
    	.pipe(mocha({
	    ui: 'bdd',
	    reporter: 'spec',
	    timeout: 5000,
	    require: [
		'babel-core/register',
		'./mocha.conf'
	    ]
	}))
	.on('error', (err) => {
	    console.log('An error occurred');
	});
});

gulp.task('watch:test:server', () => {
    gulp.watch([paths.server.test.integration, paths.server.test.unit ], gulp.series('set-test-node-env', 'integrate-test:server'/*, 'unit-test:server'*/));
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

