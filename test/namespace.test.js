var eventr = process.env.EVENTR_COV
	? require('./coverage/eventr.js')
	: require('../eventr.js')
;

describe('Eventr Namespaces', function(){
	it('should attach namespaced events', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test.namespace', function(){});

		testObj._events.should.have.property('test.namespace');
	});
	it('should attach multiple events to the same namespace', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test.namespace'  : function(){},
			'test2.namespace' : function(){},
			'test3.namespace' : function(){}
		});

		testObj._events.should.have.property('test.namespace');
		testObj._events.should.have.property('test2.namespace');
		testObj._events.should.have.property('test3.namespace');
	});
	it('should trigger namespaced events', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test.namespace', function(){
			this.newprop = true;
		});
		testObj.trigger('test');

		testObj.should.have.property('newprop', true);
	});
	it('should trigger both namespaced events and non-namespaced events', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test.namespace'  : function(){
				this.namespaced = true;
			},
			'test' : function(){
				this.nonNamespaced = true;
			}
		});
		testObj.trigger('test');

		testObj.should.have.property('namespaced', true);
		testObj.should.have.property('nonNamespaced', true);
	});
	it('should only trigger namespaced events when specified', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test.namespace'  : function(){
				this.namespaced = true;
			},
			'test' : function(){
				this.nonNamespaced = true;
			}
		});
		testObj.trigger('test.namespace');

		testObj.should.have.property('namespaced', true);
		testObj.should.not.have.property('nonNamespaced');
	});
	it('should remove events by namespace', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test.namespace' : function(){},
			'test' : function(){}
		});
		testObj.off('.namespace');

		testObj._events.should.not.have.property('test.namespace');
		testObj._events.should.have.property('test');
	});
});
