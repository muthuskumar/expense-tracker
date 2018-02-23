import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonTestFactory from 'sinon-test';

process.env.NODE_ENV = 'test';

global.assert = chai.assert;
global.expect = chai.expect;
chai.should();

global.sinon = sinon;
global.sinonTest = sinonTestFactory(sinon);

chai.use(sinonChai);
