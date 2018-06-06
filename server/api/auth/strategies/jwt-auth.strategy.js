import { ExtractJwt } from 'passport-jwt';
import config from '../../../config/environment';

import AuthError from "../../auth.error";
import { AUTH_ERR_MESSAGES } from '../auth.constants';

export default function jwtAuthStrategy(payload, done) {
    if (!payload || !payload.sub)
        done(new AuthError(AUTH_ERR_MESSAGES.INVALID_TOKEN), null);

    done(null, { _id: payload.sub });
};

export function constructOptions () {
    var opts = {};

    opts.secretOrKey = config.secretjwtSecretKey;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    return opts;
};
