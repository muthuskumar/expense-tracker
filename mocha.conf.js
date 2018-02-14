import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

global.assert = chai.assert;
global.expect = chai.expect;
chai.should();

global.sinon = sinon;

chai.use(sinonChai);
