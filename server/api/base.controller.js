import { logger } from '../config/app-logger';

export class BaseController {

	respondWithResult(res, statusCode) {
		logger.info('---------------respondWithResult---------------');

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
		logger.info('---------------handleEntityNotFound---------------');

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
		logger.info('---------------handleError---------------');

		const _statusCode = statusCode || 500;
		logger.debug('_statusCode: ', _statusCode);

		return (err) => {
			logger.debug('Error: ', err);

			res.status(_statusCode).send(err);
		}
	}

	handleErrorAsync(err, res, statusCode) {
		logger.debug('---------------handleErrorSync---------------');

		const _statusCode = statusCode || 500;
		logger.debug('_statusCode: ', _statusCode);

		res.status(_statusCode).json({ errors: { name: err.name, message: err.message } });
	}
}
