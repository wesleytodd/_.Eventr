var eventr = process.env.EVENTR_COV
	? require('./coverage/eventr.js')
	: require('../eventr.js')
;

describe('Eventr Methods', function(){
	it('should change the method names on this instance, but not the rest', function(){
		var TestObject = function(){};
		eventr(TestObject, {
			on : 'bind',
			off : 'unbind',
			trigger : 'emit'
		}, false);
		var testObj = new TestObject();
		
		testObj.should.have.property('bind');
		testObj.should.have.property('unbind');
		testObj.should.have.property('emit');

		var TestObject2 = function(){};
		eventr(TestObject2);
		var testObj2 = new TestObject2();

		testObj2.should.have.property('on');
		testObj2.should.have.property('off');
		testObj2.should.have.property('trigger');
	});
	it('should change the method names globally', function(){
		var TestObject = function(){};
		eventr(TestObject, {
			on : 'bind',
			off : 'unbind',
			trigger : 'emit'
		});
		var testObj = new TestObject();
		
		testObj.should.have.property('bind');
		testObj.should.have.property('unbind');
		testObj.should.have.property('emit');

		var TestObject2 = function(){};
		eventr(TestObject2);
		var testObj2 = new TestObject2();

		testObj2.should.have.property('bind');
		testObj2.should.have.property('unbind');
		testObj2.should.have.property('emit');
	});
});
