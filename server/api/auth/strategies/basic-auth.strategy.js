import { UserModel } from '../../user/user.model';

import { logger } from '../../../config/app-logger';

export default function basicAuthStrategy(username, password, done) {
	logger.info('---------------basicAuthStrategy---------------');

	UserModel.findOne({ username: username }).exec()
		.then((user) => {
			if (!user) {
				logger.debug('User unavailable');
				return done(null, false);
			}
			logger.debug('User available');

			if (!user.authenticate(password)) {
				logger.debug('Incorrect password');
				return done(null, false);
			}
			logger.debug('Valid password');
			
			return done(null, user);
		})
		.catch((err) => {
			logger.error('Error:', err);
			done(err, null);
		});
}

