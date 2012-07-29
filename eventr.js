/*
 * _.Eventr
 * http://wesleytodd.com/
 *
 * Version 0.3-independant
 *
 * This version is not dependant on Underscore.  If you are using Underscore please grab the master version:
 * https://github.com/wesleytodd/_.Eventr
 *
 * Turn any object into an event server or client.  Provides a simple interface for binding, unbinding and triggering events.
 * Supports namespacing, binding multiple events with single calls and chaining.
 * 
 * Basic Usage:
 * 
 *     var MyObject = function(){...}
 *     eventr(MyObject);
 *
 *     var obj = new MyObject();
 *     obj.on('event', function(){...});
 *     obj.trigger('event');
 *
 */
 (function(){
	// Local variables
	var Eventr, eventr, each;

	/**
	 * An implementation of forEach
	 *
	 * Coppied directly from Underscore.js
	 */
	each = function(obj, iterator, context) {
		if (obj == null) return;
		if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === {}) return;
			}
		} else {
			for (var key in obj) {
				if (hasOwnProperty.call(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === {}) return;
				}
			}
		}
	};

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
			if(typeof event != 'object' && typeof callback != 'function') return this;
			
			// Set up this reference for inside the loops
			var base = this;

			// Recursive if passed in a hash of events or a string of more than one event
			if(typeof event == 'object'){

				// Loop through the hash and add each individually
				each(event, function(f, e){
					base.on(e, f/*, context*/);
				});

			} else if(typeof event == 'string'){

				// A space separated list of events can be passed in, so check for that and recurse
				event = event.split(/\s+/);
				if(event.length > 1){

					// Loop through events and add each individually
					each(event, function(e){
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
			if(typeof event == 'undefined'){
				delete base._events;
				return base;
			}

			// If callback is undefined then remove all the registered callbacks for that event, otherwise loop and remove only the callback
			if(event && base._events){

				// If an exact match is found just process that set
				if(base._events[event]){
					// If the event exists and no callback was specified, remove all callbacks for that event
					if(typeof callback == 'undefined'){
						delete base._events[event];
						return base;
					}

					// Loop through the events callbacks and remove if equal
					each(base._events[event], function(fnc){
						if(fnc == callback){
							base._events[event].splice(base._events[event].indexOf(fnc), 1);
						}
					});

					// If this event is now empty, remove it
					if(base._events[event].length == 0) delete base._events[event];
					return base;
				}

				// If it has gotten to this point, the event is either a namespace or invalid
				// So try and get the namespace
				var namespace = event.match(/\.([^.]+)$/g);

				// Loop through the events and see if it matches the namespace
				each(base._events, function(fs, e){
					match = e.indexOf(namespace);
					if(match != -1){

						// It matches the name space and a callback was not specified, remove all events for namespace
						if(typeof callback == 'undefined'){
							delete base._events[e]
							return base;
						}

						// A callback was defined, so loop through the functions and test for equality
						each(fs, function(f){
							if(f = callback){
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

			// Setup this and arguments for inside loops
			var base = this,
				args = Array.prototype.slice.call(arguments, 1);

			// Make sure that event and events hash exist before continuing
			if(typeof event == 'undefined' || typeof base._events == 'undefined') return base;
			
			if(event.indexOf('.') !== -1 && typeof base._events[event] != 'undefined'){

				// Loop through events and call the callbacks
				each(base._events[event], function(f){
					f.apply(base, args);
				});

			}

			// If an exact namespaced match was not found, loop all events
			each(base._events, function(f,e){

				// Match event names without namespaces
				var match = e.match(/^([^.]+)/g);

				// Test that event name matches
				if(match && match[0] == event){

					// Loop through events and call the callbacks
					each(base._events[e], function(f){
						f.apply(base, args);
					});

				}
			});

			return base;

		} // End Eventr.trigger()

	} // End Eventr

    /**
     * Extend object from Eventr
     * 
     * @param object obj The object to add the events functions to
     * @param object map (optional) A hash of new function names to the existing functions
     * @param bool global (optional) If true, the map passed in will be applied globally
     * 
     * Extends the object passed in with the Eventr functions.  If a map of events is passed
     * in it will be used to assign the function names on the object.  If global is true,
     * all calls to this function after will use the original mapping.
     */
	window.eventr = function(obj, map, global){
        var cEventr = {};
		for (var prop in Eventr) {
			cEventr[prop] = Eventr[prop];
		}
		if(typeof map != 'undefined'){
			cEventr[map.on] = Eventr.on;
			cEventr[map.off] = Eventr.off;
			cEventr[map.trigger] = Eventr.trigger;
			delete cEventr.on;
			delete cEventr.off;
			delete cEventr.trigger;
            if(typeof global == 'undefined' || global == true){
                Eventr = cEventr;
            }
		}
		for (var prop in cEventr) {
			obj.prototype[prop] = cEventr[prop];
		}
		return obj;
	};

})();
