import { logger } from '../config/app-logger';
import ValidationError from './validation.error';
import AuthError from './auth.error';

export class BaseController {

	respondWithResult(res, statusCode) {
		logger.info('---------------BaseController.respondWithResult---------------');

		const _statusCode = statusCode || 200;
		logger.debug('_statusCode: ', _statusCode);

		return (entity) => {
			logger.debug('Entity result: ', entity);

			if (entity) {
				return res.status(_statusCode).json(entity);
			}
			return null;
		}
	}

	handleEntityNotFound(res, statusCode) {
		logger.info('---------------BaseController.handleEntityNotFound---------------');

		const _statusCode = statusCode || 404;
		logger.debug('_statusCode: ', _statusCode);

		return (entity) => {
			logger.debug('Entity not found: ', entity);

			if (!entity) {
				logger.debug('Sending ' + _statusCode + ' as response.');
				res.status(_statusCode).end();
				return null;
			}
			return entity;
		}
	}

	handleError(res, statusCode) {
		logger.info('---------------BaseController.handleError---------------');

		const _statusCode = statusCode || 500;
		logger.debug('_statusCode: ', _statusCode);

		return (err) => {
			logger.debug('Error: ', err);

			res.status(_statusCode).send(err);
		}
	}

	handleErrorAsync(err, res, statusCode) {
		logger.info('---------------BaseController.handleErrorSync---------------');

		const _statusCode = statusCode || 500;
		logger.debug('_statusCode: ', _statusCode);

		res.status(_statusCode).json({ errors: { name: err.name, message: err.message } });
	}

	getStatusCodeForError(err) {
		logger.info('---------------BaseController.getStatusCodeForError---------------');

		if (err instanceof ValidationError)
			return 401;
		if (err instanceof AuthError)
			return 404;

		return 500;
	}
}
