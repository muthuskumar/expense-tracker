import { logger } from '../config/app-logger';

export class BaseController {

    respondWithResult(res, statusCode) {
	logger.debug('---------------respondWithResult---------------');
	
	const _statusCode = statusCode || 200;
	logger.debug('_statusCode: ', _statusCode);
	
	return (entity) => {
	    logger.debug('Entity: ', entity);
	    
	    if(entity) {
		return res.status(_statusCode).json(entity);
	    }
	    return null;
	}
    }

    handleEntityNotFound(res, statusCode) {
	logger.debug('---------------handleEntityNotFound---------------');
	
	const _statusCode = statusCode || 404;
	logger.debug('_statusCode: ', _statusCode);
	
	return (entity) => {
	    logger.debug('Entity: ', entity);
	    
	    if(!entity) {
		return res.status(_statusCode).end();
	    }
	    return entity;
	}
    }
    
    handleError(res, statusCode) {
	logger.debug('---------------handleError---------------');
	
	const _statusCode = statusCode || 500;
	logger.debug('_statusCode: ', _statusCode);
	
	return (err) => {
	    logger.debug('Error: ', err);

	    res.status(_statusCode).send(err);
	}
    }
}

