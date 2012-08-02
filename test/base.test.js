var eventr = require('../eventr.js'),
	should = require('should');

describe('Eventr', function(){
	it('should extend an object constructors prototype', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();

		testObj.should.have.property('on');
		testObj.should.have.property('off');
		testObj.should.have.property('trigger');
	});
	it('should extend an object instance', function(){
		var TestObject = function(){};
		var testObj = new TestObject();
		eventr(testObj);

		testObj.should.have.property('on');
		testObj.should.have.property('off');
		testObj.should.have.property('trigger');
	});
	it('should attach a single event and callback', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		var callback = function(){};
		testObj.on('test', callback);

		testObj.should.have.property('_events');
		testObj._events.should.have.property('test');
		testObj._events.test[0].should.equal(callback);
	});
	it('should attach multiple events as a hash', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test1' : function(){},
			'test2' : function(){},
			'test3' : function(){}
		});

		testObj.should.have.property('_events');
		testObj._events.should.have.property('test1');
		testObj._events.should.have.property('test2');
		testObj._events.should.have.property('test3');
	});
	it('should attach muliple events as a space seperated list', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test1 test2 test3', function(){});

		testObj.should.have.property('_events');
		testObj._events.should.have.property('test1');
		testObj._events.should.have.property('test2');
		testObj._events.should.have.property('test3');
	});
	it('should attach multiple handlers to a single event', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test1', function(){});
		testObj.on('test1', function(){});
		testObj.on('test1', function(){});

		testObj._events.test1.should.have.length(3);
	});
	it('should trigger an attached event', function(){
		var TestObject = function(){
			this.foo = 'bar';
		};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test', function(){
			this.foo = 'foo';
		});
		testObj.trigger('test');

		testObj.should.have.property('foo', 'foo');
	});
	it('should pass arguments to triggered callbacks', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test', function(prop, val){
			this[prop] = val;
		});
		testObj.trigger('test', 'foo', 'bar');
		
		testObj.should.have.property('foo', 'bar');
	});
	it('should trigger all callbacks on an event', function(){
		var TestObject = function(){
			this.total = 0;
		};
		eventr(TestObject);
		var testObj = new TestObject();

		testObj.on('test', function(){
			this.total += 1;
		});
		testObj.on('test', function(){
			this.total += 2;
		});
		testObj.on('test', function(){
			this.total += 3;
		});
		testObj.trigger('test');

		testObj.total.should.equal(6);
	});
	it('should remove all handlers for an event', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on('test', function(){});
		testObj.off('test');

		testObj._events.should.not.have.property('test');
	});
	it('should remove a single callback from an event', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		var callback = function(){};
		testObj.on('test', callback);
		testObj.on('test', function(){});
		testObj.on('test', function(){});
		testObj._events.test.length.should.equal(3, 'There was an error adding the event handlers');

		testObj.off('test', callback);

		testObj._events.test.length.should.equal(2);
	});
	it('should remove all events', function(){
		var TestObject = function(){};
		eventr(TestObject);
		var testObj = new TestObject();
		testObj.on({
			'test' : function(){},
			'test test1' : function(){},
			'test2' : function(){}
		});
		
		testObj._events.test.should.have.length(2, 'There was an error adding the event handlers');
		
		testObj.off();

		testObj.should.not.have.property('_events');
	});
});
