import { ExtractJwt } from 'passport-jwt';
import config from '../../../config/environment';

import { logger } from '../../../config/app-logger';

export default function jwtAuthStrategy(payload, done) {
    logger.info('---------------jwtAuthStrategy---------------');

    if (!payload || (Object.keys(payload).length === 0 && payload.constructor === Object)) {
        logger.debug('Payload unavailable');
        return done(null, false);
    }

    if (!payload.userId) {
        logger.debug('UserId unavailable in payload');
        return done(null, false);
    }
        
    logger.debug('Payload available', payload);
    return done(null, { _id: payload.userId });
}

export function constructOptions () {
    logger.info('---------------constructOptions---------------');

    var opts = {};

    opts.secretOrKey = config.jwtSecretKey;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    logger.debug('Opts: ' + opts);

    return opts;
}
