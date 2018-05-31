import passport from 'passport';
import { BasicStrategy } from 'passport-http';

import basicAuthStrategy from './basic-auth.strategy';

passport.use(new BasicStrategy(basicAuthStrategy));
