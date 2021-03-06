(function(){
	var Obj = function(){
		this.foo = 'bar';
	};
	_.eventr(Obj);

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

	var Obj2 = function(){};
	_.eventr(Obj2, {
        on      : 'bind',
        off     : 'unbind',
        trigger : 'emit'
    }, false);
	var obj2 = new Obj2();

    //Test 13
    console.log('Test 13:', typeof obj2.bind != 'undefined');

    //Test 14
    console.log('Test 14:', typeof obj2.on == 'undefined');

	var Obj3 = function(){};
	_.eventr(Obj3);
	var obj3 = new Obj3();
   
   //Test 15
   console.log('Test 15:', typeof obj3.off != 'undefined')

   //Test 16
   console.log('Test 16:', typeof obj3.unbind == 'undefined')

	var Obj4 = function(){};
	_.eventr(Obj4, {
        on      : 'bind',
        off     : 'unbind',
        trigger : 'other'
    }, true);
	var obj4 = new Obj4();

	var Obj5 = function(){};
	_.eventr(Obj5);
	var obj5 = new Obj5();

    //Test 17
    console.log('Test 17:', typeof obj5.other != 'undefined');

    //Test 18
    console.log('Test 18:', typeof obj5.trigger == 'undefined');

})();
