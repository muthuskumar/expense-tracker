import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonTestFactory from 'sinon-test';
import {} from 'sinon-mongoose';

process.env.NODE_ENV = 'test';

global.assert = chai.assert;
global.expect = chai.expect;
global.should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

global.sinon = sinon;
global.sinonTest = sinonTestFactory(sinon);

