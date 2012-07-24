(function(){
	var Obj = function(){
		this.foo = 'bar';
	};
	eventr(Obj);

	var obj         = new Obj();
	var originalFoo = obj.foo;
	var newFoo      = 'newfoo';

	obj.trigger('event');  // No event triggered

	//Test 1
	console.log('Test 1:', originalFoo === obj.foo);

	obj.on('setFoo', function(){
		this.foo = newFoo;
	});

	//Test 2
	console.log('Test 2:', typeof obj._events['setFoo'] != 'undefined');

	obj.on({
		'resetFoo' : function(){
			this.foo = originalFoo;
		}
	});

	obj.trigger('setFoo');

	//Test 3
	console.log('Test 3:', obj.foo == newFoo);

	obj.on('new-prop', function(key, val){
		this[key] = val;
		//Test 4
		console.log('Test 4:', this == obj);
		//Test 5
		console.log('Test 5:', (key == 'bar' && val == 'bar'));
	});

	obj.trigger('new-prop', 'bar', 'bar');

	//Test 6
	console.log('Test 6:', (typeof obj.bar != 'undefined' && obj.bar == 'bar'));

	obj.off('setFoo');

	//Test 7
	console.log('Test 7:', typeof obj._events['setFoo'] == 'undefined');

	obj.on({
		'event.namespace' : function(test){
			//Test 8 & 11
			console.log('Test '+test+':', true);
		},
		'otherevent.namespace' : function(test){
			//Test 8.5 & 11.5
			console.log('Test 8.5 & 11.5:', false);
		},
		'event' : function(test){
			if(test == 8){
				test += 1;
				//Test 9
				console.log('Test '+test+':', true);
			} else {
				//Test 11
				console.log('Test 11:', false);
			}
		}
	});

	//Test 8 & 8.5
	obj.trigger('event', 8);

	//Test 10
	console.log('Test 10:', typeof obj._events['otherevent.namespace'] != 'undefined');

	//Test 11
	obj.trigger('event.namespace', 11);

	obj.off('.namespace');

	//Test 11.5
	obj.trigger('otherevent');

	obj.off();

	//Test 12
	console.log('Test 12:', typeof obj._events == 'undefined');

})();
