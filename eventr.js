/*
 * _.Eventr
 * http://wesleytodd.com/
 *
 * Version 0.1
 *
 * Requires     Underscore
 * 
 * Turn any object into an event server or client.  Provides a simple interface for binding, unbinding and triggering events.
 * Supports namespacing, binding multiple events with single calls and chaining.
 * 
 * Basic Usage:
 * 
 *     var MyObject = function(){...}
 *     _.eventr(MyObject);
 *
 *     var obj = new MyObject();
 *     obj.on('event', function(){...});
 *     obj.trigger('event');
 *
 */
 (function(){
	// Local variables
	var Eventr, eventr;

	Eventr = {
		/**
		 * Eventr.on()
		 *
		 * Bind an event to the object.
		 *
		 * @param object|string event This can be either an event name string or a hash of events and callback functions
		 * @param function callback A callback function to be called when the event is triggered
		 *
		 * This function supports adding multiple events in the form of an event hash:
		 *
		 *     Eventr.on({
		 *         'change' : function(){...},
		 *         'custom' : function(){...}
		 *     });
		 *
		 * Or you can add a single event:
		 *
		 *     Eventr.on('change', function(){...});
		 *
		 * You can also use namespacing in the form of 'event.namespace':
		 *
		 *     Eventr.on('change.eventr', function(){...});
		 *
		 * Only single namespaces are valid. (good: 'change.ns', bad: 'change.ns.ns2')
		 *
		 * If multiple event share the same callback function you can specify them all at once:
		 *
		 *     Eventr.on('change keyup update', function(){...});
		 *
		 * @TODO Add context specification so that callbacks can specify 'this'.
		 * The issue I was having with this is that when someone calls .off() with a
		 * specific callback function you cannot test for equality.  I was thinking 
		 * about adding a reference to the original function to the prototype.  But 
		 * my first attempt failed...
		 * 
		 */
		on : function(event, callback/*, context*/){
			// Don't allow callback to be undefined if event is not a hash object
			if(!_.isObject(event) && !_.isFunction(callback)) return this;
			
			// Set up this reference for inside the loops
			var base = this;

			// Recursive if passed in a hash of events or a string of more than one event
			if(_.isObject(event)){

				// Loop through the hash and add each individually
				_.each(event, function(f, e){
					base.on(e, f/*, context*/);
				});

			} else if(_.isString(event)){

				// A space separated list of events can be passed in, so check for that and recurse
				event = event.split(/\s+/);
				if(event.length > 1){

					// Loop through events and add each individually
					_.each(event, function(e){
						base.on(e, callback/*, context*/);
					});

				} else {

					//Actually add the event...finally
					event = event[0];
					//context = context || base;
					base._events = base._events || {};
					base._events[event] = base._events[event] || [];
					base._events[event].push(callback);

				}
			}
			return base;
		}, // End Eventr.on()

		/**
		 * Eventr.off()
		 * 
		 * Unbind events and their callbacks
		 *
		 * @param string event An event name or namespace.  Only single namespaces are supported (ex. 'change.eventr' or '.eventr', not 'change.eventr.other')
		 * @param function callback Optional. A specific callback function to be removed from the event or namespace
		 *
		 * This function can be called in three ways:
		 *  - No arguments                    : will remove all events from the object
		 *  - One argument (event)            : will remove all events on the object for that event string or namespace
		 *  - Two arguments (event, callback) : will only remove a callback if the event name or namespace and callback function pass an equality test
		 *
		 *  When removing events you can use just a namespace if you want to remove a set of events:
		 *
		 *      Eventr.off('.namespace');
		 *
		 *  After the event callback is removed it checks to see if that event is now empty of callbacks and will remove it if it is.
		 */
		off : function(event, callback){
			// Setup this for inside loops
			var base = this;

			// Remove all events on this object
			if(_.isUndefined(event)){
				delete base._events;
				return base;
			}

			// If callback is undefined then remove all the registered callbacks for that event, otherwise loop and remove only the callback
			if(event && base._events){

				// If an exact match is found just process that set
				if(base._events[event]){
					// If the event exists and no callback was specified, remove all callbacks for that event
					if(_.isUndefined(callback)){
						delete base._events[event];
						return base;
					}

					// Loop through the events callbacks and remove if equal
					_.each(base._events[event], function(fnc){
						if(_.isEqual(fnc, callback)){
							base._events[event].splice(base._events[event].indexOf(fnc), 1);
						}
					});

					// If this event is now empty, remove it
					if(_.isEmpty(base._events[event])) delete base._events[event];
					return base;
				}

				// If it has gotten to this point, the event is either a namespace or invalid
				// So try and get the namespace
				var namespace = event.match(/\.([^.]+)$/g);

				// Loop through the events and see if it matches the namespace
				_.each(base._events, function(fs, e){
					match = e.indexOf(namespace);
					if(match != -1){

						// It matches the name space and a callback was not specified, remove all events for namespace
						if(_.isUndefined(callback)){
							delete base._events[e]
							return base;
						}

						// A callback was defined, so loop through the functions and test for equality
						_.each(fs, function(f){
							if(_.isEqual(f, callback)){
								base.off(e, callback);
							}
						});
					}
				});
			}

			return base;

		}, // End Eventr.off()

		/**
		 * Eventr.trigger()
		 *
		 * Triggers an event on this object
		 *
		 * @param string event An event name to trigger.
		 *
		 * Triggers an event and calls all the registered callbacks matching that
		 * event name.  All arguments after the event name are passed into the 
		 * event callbacks
		 *
		 * @TODO This needs to trigger the callbacks with context supported.
		 * Currently it just supplies the current object as the context (this)
		 *
		 */
		trigger : function(event){

			// Setup this for inside loops
			var base = this;

			// Make sure that event and events hash exist before continuing
			if(_.isUndefined(event) || _.isUndefined(base._events)) return base;

			// If the full event string exists, call it
			if(!_.isUndefined(base._events[event])){

				_.each(base._events[event], function(f){
					f.apply(base, Array.prototype.slice.call(arguments, 1));
				});

			} else {
				
				// Otherwise it might be a namespaced event.  Loop events to test
				_.each(base._events, function(fs, e){

					// Get the first part of the event name (ex. 'change.eventr' yields 'change')
					var match = e.match(/^([^.]+)/g);

					// If a match was found and that match equals the event name, call trigger with the fully qualified name
					if(match.length == 1 && match[0] == event){
						base.trigger(e, Array.prototype.slice.call(arguments, 1));
					}
				});

			}

			return base;

		} // End Eventr.trigger()

	} // End Eventr

	/**
	 * Extend object from Eventr
	 */
	eventr = function(obj, map){
		if(!_.isUndefined(map)){
			Eventr[map.on] = Eventr.on;
			Eventr[map.off] = Eventr.off;
			Eventr[map.trigger] = Eventr.trigger;
			delete Eventr.on;
			delete Eventr.off;
			delete Eventr.trigger;
		}
		return _.extend(obj.prototype, Eventr);
	};

	/**
	 * Add Eventr to the underscore object
	 */
	_.mixin({
		eventr : eventr
	});

})();
