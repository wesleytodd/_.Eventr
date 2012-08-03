var eventr = process.env.EVENTR_COV
	? require('./coverage/eventr.js')
	: require('../eventr.js')
;

describe('Eventr Chaning', function(){
	it('should execute chained events', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test' : function(){
				this.newprop = true;
			}
		}).trigger('test').off('test');
		
		testObj.should.have.property('newprop', true);
		testObj._events.should.not.have.property('test');
	});
});
