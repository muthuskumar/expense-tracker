export class BaseController {

    respondWithResult(res, statusCode) {
	const _statusCode = statusCode || 200;
	return (entity) => {
	    if(entity) {
		return res.status(_statusCode).json(entity);
	    }
	    return null;
	}
    }

    handleEntityNotFound(res, statusCode) {
	const _statusCode = statusCode || 404;
	return (entity) => {
	    if(!entity) {
		return res.status(_statusCode).end();
	    }
	    return entity;
	}
    }
    
    handleError(res, statusCode) {
	const _statusCode = statusCode || 500;
	return (err) => {
	    res.status(_statusCode).send(err);
	}
    }
}

