import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy as JWTStrategy }from 'passport-jwt';

import basicAuthStrategy from './basic-auth.strategy';
import jwtAuthStrategy, { constructOptions } from './jwt-auth.strategy';

passport.use(new BasicStrategy(basicAuthStrategy));
passport.use(new JWTStrategy(constructOptions(), jwtAuthStrategy));

