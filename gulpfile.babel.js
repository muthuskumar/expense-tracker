// Gulp task runner for whole project.

import gulp from 'gulp';
import eslint from 'gulp-eslint';

gulp.task('lint', () => {
    return gulp.src(['**/*.js', '!node_modules/**', '!angular-src/**'])
	.pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError());
});

gulp.task('default', () => {
    gulp.watch(['**/*.js', '!node_modules/**', '!angular-src/**'], ['lint'])
});
