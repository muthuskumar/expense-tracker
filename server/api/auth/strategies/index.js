import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { JwtStrategy } from 'passport-jwt';

import basicAuthStrategy from './basic-auth.strategy';
import jwtAuthStrategy, { constructOptions } from './jwt-auth.strategy';

passport.use(new BasicStrategy(basicAuthStrategy));
passport.use(new JwtStrategy(constructOptions, jwtAuthStrategy));
