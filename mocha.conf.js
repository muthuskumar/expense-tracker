import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonTestFactory from 'sinon-test';
import chaiAsPromised from 'chai-as-promised';

process.env.NODE_ENV = 'test';

global.assert = chai.assert;
global.expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

global.sinon = sinon;
global.sinonTest = sinonTestFactory(sinon);

chai.use(sinonChai);
