# _.Eventr

A Javascript and Underscore event client/server implementation.

Eventr can turn any object into an event machine.  Emitting or listening for, subscribing or publishing, all it takes is:

    var Obj = function(){};
    _.eventr(Obj);

After this your Object has all of the necessary methods for emitting and listening to events (`on`, `off`, `trigger`).  These functions are added onto your objects prototype, so if you already have functions with these names in there be careful to provide a name map for the second argument.  Example:

    var Obj = function(){
        // An object that already has on, off or trigger funtions
    };
    _.eventr(Obj, {
        on      : 'bind',
        off     : 'unbind',
        trigger : 'emit'
    });

After this your functions will not be mapped to `on`, `off` and `trigger`, but to `bind`, `unbind` and `emit`.  The third and optional argument is whether the function map is to be applied globally.  This defaults to true.

## Binding Events (on)

Events can be bound to an object with the `on` function call.  Events can be passed in as a hash of event/callback pairs or as an event string and single callback.  If multiple events share the same callback function, a space separated list can be used.

    obj.on({
        'change' : function(){...},
        'change click' : function(){...},
        'change.namespace' : function(){...}
    });

    obj.on('custom-event', functio(){...});

## Un-Binding Events (off)

Events and callbacks can be removed with the `off` function call.  Only a single event can be removed at a time (although this might change to use a space separated list).  The first argument is the event name or namespace (see namespaces).  An optional second argument is the specific callback to remove.  If no arguments are passed then all events attached to the object are removed.

    obj.off('click');  // Removes any click handlers
    obj.off('change', callback) // Removes the function `callback` from the `change` event
    obj.off(); // Removes all event callbacks

## Triggering Events (trigger)

Events are triggered using the `trigger` function call.  Any extra arguments passed to the trigger function are passed into the callbacks.

    obj.trigger('change', newValue);

## Chaining

All event functions can be chained together:

    obj.on('change', function(){})
       .trigger('change');

## Namespaces

Eventr support namespacing events for modularization.  Namespaces are used in the format 'event.namespace'.  This is a good practice to use so that you can easily remove just your events without bothering other peoples events.

**How To Namespace**

    // Setup the object
    var Obj = _.eventr(function(){});
    var obj = new Obj();
    
    // Bind handlers
    obj.on('change', function(){
        console.log('Foo');
    });
    obj.on('change.example', function(){
        console.log('Bar');
    });

    // Trigger events
    obj.trigger('change');  // Foo Bar
    obj.trigger('change.example');  // Bar

    // Remove namespaced event
    obj.off('.example');

    // Trigger again
    obj.trigger('change');  // Foo

As you can see we can trigger events regardless of their namespace or within a specific namespace.

## Why another event library?

Because I felt like it.  More importantly all the other event libraries I found either used function names I don't like, or didn't support the features I wanted.  This implementation takes most of the stuff I like from [MicroEvent.js](https://github.com/jeromeetienne/microevent.js), [Smoke Signals](https://github.com/bentomas/smokesignals) and [Backbone](https://github.com/documentcloud/backbone) and adds some features I wanted.
