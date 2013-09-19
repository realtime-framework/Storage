// UTIL
(function(Realtime, undefined) {
    /*
     *   @class Realtime.Util Contains utility methods.
     */
    (function(Util, undefined) {
        /*
         *   @function {public void} Realtime.Util.series Run an array of functions in series, each one running once the previous function has completed.
         *   @param {Function} fns [ARRAY]An array containing functions to run, each function is passed a callback it must call on completion.
         *   @param {Function} callback An optional callback to run once all the functions have completed. This function gets an array of all the arguments passed to the callbacks used in the array.
         */
        Util.series = function(fns, callback) {
            if (!callback) callback = function() {};
            if (fns.length === 0) return callback();
            var completed = 0;
            var data = [];
            var iterate = function() {
                fns[completed](function(results) {
                    data[completed] = results;
                    if (++completed == fns.length) {
                        // this is preferred for .apply but for size, we can use data
                        if (callback) callback.apply(data, data);
                    } else {
                        iterate();
                    }
                });
            };
            iterate();
        };
        /*
         *   @function {public void} Realtime.Util.parallel Run an array of functions in parallel, without waiting until the previous function has completed.
         *   @param {Function} fns [ARRAY]An array containing functions to run, each function is passed a callback it must call on completion.
         *   @param {Function} callback An optional callback to run once all the functions have completed. This function gets an array of all the arguments passed to the callbacks used in the array.
         */
        Util.parallel = function(fns, callback) {
            if (!callback) callback = function() {};
            if (fns.length === 0) return callback();
            var started = 0;
            var completed = 0;
            var data = [];
            var iterate = function() {
                fns[started]((function(i) {
                    return function(results) {
                        data[i] = results;
                        if (++completed == fns.length) {
                            if (callback) callback.apply(data, data);
                            return;
                        }
                    };
                })(started));
                if (++started != fns.length) iterate();
            };
            iterate();
        };
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        /*
         *   @function {public String} Realtime.Util.guidGenerator Generates a globally unique identifier.
         *   @returns A string representing a globally unique identifier.
         */
        Util.guidGenerator = function() {
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        };
        /*
         *   @function {public String} Realtime.Util.idGenerator Generates a random identifier composed of 8 characters in length.
         *   @returns A string representing an identifier.
         */
        Util.idGenerator = function() {
            return (S4() + S4());
        };
        /*
         *   @function {public Function} Realtime.Util.proxy Returns a function with the given context.
         *   @param {Function} fn The function whose context will be changed.
         *   @param {Object} context The object to which the context of the function should be set.
         *   @return A function with the new context.
         */
        Util.proxy = function(fn, context) {
            if (typeof fn === 'function' && typeof context === 'object') {
                return function() {
                    return fn.apply(context, arguments);
                };
            }
        };
        /*
         *   @function {public Function} Realtime.Util.parse Takes the name of a function and converts it into a function.
         *   @param {Function} fnName The name of the function.
         *   @return The generated function.
         */
        Util.parse = function(fnName) {

            if (typeof fnName == 'function') return fnName;

            if (typeof fnName != 'string') return null;

            var args = "",
                body = "return " + fnName + "(";
            if (arguments.length != 1) {
                for (var i = 1; i < arguments.length; ++i) {
                    args += arguments[i] + ',';
                }
                args = args.substring(0, args.length - 1);
            }

            body += args + ");";
            return new window.Function(args, body);
        };
        /*
         *   @function {public void} Realtime.Util.loadScript Loads a script dynamically into the page.
         *   @param {String} resource Path to the resource.
         *   @param {Function} callback The function to be called after the script is loaded.
         */
        Util.loadScript = function(resource, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";

            if (script.readyState) { //IE
                script.onreadystatechange = function() {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback.apply(this, arguments);
                    }
                };
            } else {
                script.onload = function() {
                    callback.apply(this, arguments);
                };
            }

            script.src = resource;
            if (document.getElementsByTagName("head").length != 0) {
                document.getElementsByTagName("head")[0].appendChild(script);
            } else {
                document.body.appendChild(script);
            }
        };
        /*
         *   @function {public Object} Realtime.Util.keys Gets the names of the properties in an object.
         *   @param {Object} obj The target object.
         *   @returns An array containing the names of the properties.
         */
        Util.keys = window.Object.keys || function(obj) {
            var keys = [],
                key;
            for (key in obj) {
                if (window.Object.prototype.hasOwnProperty.call(obj, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
        /*
         *   @function {public Boolean} ? Checks if the object is an array.
         *   @param {Object} obj The Object to be tested.
         *   @returns A boolean stating the result of the type check.
         */
        Util.isArray = window.Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        };

    })(Realtime.Util = Realtime.Util || {});
})(window.Realtime = window.Realtime || {});
// EVENT
(function(Realtime, undefined) {
    /*
     *   @class Realtime.Event Provides event capabilities to any object. {@code: Event\example.js}
     */
    (function(Event, undefined) {

        var Provider = function() {
            var _listeners = {};
            var _onceListeners = {};

            this.bind = function(events) {
                for (var type in events) {
                    if (typeof events[type] === 'function') {
                        if (!_listeners[type])
                            _listeners[type] = [];
                        _listeners[type].push(events[type]);
                    }
                }
            };

            this.once = function(events) {
                var self = this;
                for (var type in events) {
                    if (typeof events[type] === 'function') {
                        if (!_onceListeners[type]) {
                            _onceListeners[type] = [];
                        }
                        _onceListeners[type].push(events[type]);
                    }
                }
            };

            this.unbind = function(events) {
                for (var type in events) {
                    if (Object.prototype.toString.call(_listeners[type]) === '[object Array]') {
                        for (var i = 0, len = _listeners[type].length; i < len; i++) {
                            if (_listeners[type][i] === events[type]) {
                                _listeners[type].splice(i, 1);
                                break;
                            }
                        }
                    }

                    if (Object.prototype.toString.call(_onceListeners[type]) === '[object Array]') {
                        for (var i = 0, len = _onceListeners[type].length; i < len; i++) {
                            if (_onceListeners[type][i] === events[type]) {
                                _onceListeners[type].splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            };

            this.unbindAll = function(eventType) {
                if (!eventType) {
                    delete _listeners;
                    _listeners = {};
                    delete _onceListeners;
                    _onceListeners = {};
                }

                if (eventType) {
                    _listeners[eventType] = undefined;
                    _onceListeners[eventType] = undefined;
                }
            };

            this.fire = function(events) {
                var evt;

                for (var type in events) {

                    evt = {};

                    for (var key in events[type]) {
                        var obj = events[type][key];
                        evt[key] = obj;
                    }

                    var listenersToRun = [];

                    if (Object.prototype.toString.call(_listeners[type]) === '[object Array]') {
                        for (var i = 0; i < _listeners[type].length; i++) {
                            listenersToRun.push((function(ctx, listener) {
                                return function(cb) {
                                    listener.call(ctx, evt);
                                    cb();
                                };
                            })(this, _listeners[type][i]));
                        }
                    }

                    if (Object.prototype.toString.call(_onceListeners[type]) === '[object Array]') {
                        do {
                            var listener = _onceListeners[type].shift();

                            if (listener) {
                                var fn = (function(ctx, fn) {
                                    return function(cb) {
                                        fn.call(ctx, evt);
                                        cb();
                                    };
                                })(this, listener);

                                listenersToRun.push(fn);
                            }

                        } while (_onceListeners[type].length > 0);
                    }

                    Realtime.Util.parallel(listenersToRun);
                }
            };

            this.listeners = function(eventType) {

                var arr = [];

                if (Object.prototype.toString.call(_listeners[eventType]) === '[object Array]') {
                    arr = arr.concat(_listeners[eventType]);
                }

                if (Object.prototype.toString.call(_onceListeners[eventType]) === '[object Array]') {
                    arr = arr.concat(_onceListeners[eventType]);
                }

                return arr;
            };
        };
        /*
         *   @function {public void} Realtime.Event.extend Provides the specified object with event capabilities.
         *   @param {Object} target The object to provide event capabilities.
         */
        Event.extend = function(target) {
            var provider = new Provider();
            for (var method in provider) {
                target[method] = provider[method];
            };
        };
    })(Realtime.Event = Realtime.Event || {});
})(window.Realtime = window.Realtime || {});
// MESSAGING
(function(Realtime, undefined) {
    /**
     *	@class Realtime.Messaging Provides access to the Realtime Messaging functionalities.
     */
    (function(Messaging, undefined) {

        Realtime.Event.extend(Messaging);
        /**
         *   @property {Boolean} Realtime.Messaging.isReady Tells if the Messaging is ready.
         */
        Messaging.isReady = false;
        /**
         *	@function {public void} Realtime.Messaging.ready Binds a function to the 'ready' event. In case the event was already raised, the function is called right away.
         *	@param {Function} fn The function to call.
         */
        Messaging.ready = function(fn) {
            !Messaging.isReady ? Messaging.bind({
                ready: fn
            }) : fn();
        };
    })(window.Realtime.Messaging = window.Realtime.Messaging || {});
})(window.Realtime = window.Realtime || {});
//JSON2
(function(Realtime, undefined) {
    /*
     *   @class Realtime.JSON JavaScript Object Notation is a lightweight data-interchange format made by Douglas Crockford. It's enclosed in the xRTML namespace to ensure its expected behaviour. More information available at: http://www.json.org/.
     */

    /*
     *   @function {public String} Realtime.JSON.stringify The stringify method takes a value and an optional replacer, and an optional space parameter, and returns a JSON text.
     *   @param {Object} value The object to transform.
     *   @param {optional Object} replacer The replacer can be a function that can replace values, or an array of strings that will select the keys.
     *   @param {optional Object} space Use of the space parameter can produce text that is more easily readable. Can be a number (the number of space characters) or a string (the specific space to use).
     *   @return The JSON string.
     */

    /*
     *   @function {public Object} Realtime.JSON.parse The parse method takes a text and an optional reviver function, and returns a JavaScript value if the text is a valid JSON text.
     *   @param {String} text The string to parse. Must be a valid JSON string.
     *   @param {optional Function} reviver Prescribes how the value originally produced by parsing is transformed, before being returned.
     *   @return The parsed object.
     */
    (function(JSON, undefined) {
        (function() {
            "use strict";

            function f(n) {
                // Format integers to have at least two digits.
                return n < 10 ? '0' + n : n;
            }

            if (typeof Date.prototype.toJSON !== 'function') {

                Date.prototype.toJSON = function(key) {

                    return isFinite(this.valueOf()) ?
                        this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z' : null;
                };

                String.prototype.toJSON =
                    Number.prototype.toJSON =
                    Boolean.prototype.toJSON = function(key) {
                        return this.valueOf();
                };
            }

            var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                gap,
                indent,
                meta = { // table of character substitutions
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"': '\\"',
                    '\\': '\\\\'
                },
                rep;


            function quote(string) {

                // If the string contains no control characters, no quote characters, and no
                // backslash characters, then we can safely slap some quotes around it.
                // Otherwise we must also replace the offending characters with safe escape
                // sequences.

                escapable.lastIndex = 0;
                return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
                    var c = meta[a];
                    return typeof c === 'string' ? c :
                        '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' : '"' + string + '"';
            }


            function str(key, holder) {

                // Produce a string from holder[key].

                var i, // The loop counter.
                    k, // The member key.
                    v, // The member value.
                    length,
                    mind = gap,
                    partial,
                    value = holder[key];

                // If the value has a toJSON method, call it to obtain a replacement value.

                if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                    value = value.toJSON(key);
                }

                // If we were called with a replacer function, then call the replacer to
                // obtain a replacement value.

                if (typeof rep === 'function') {
                    value = rep.call(holder, key, value);
                }

                // What happens next depends on the value's type.

                switch (typeof value) {
                    case 'string':
                        return quote(value);

                    case 'number':

                        // JSON numbers must be finite. Encode non-finite numbers as null.

                        return isFinite(value) ? String(value) : 'null';

                    case 'boolean':
                    case 'null':

                        // If the value is a boolean or null, convert it to a string. Note:
                        // typeof null does not produce 'null'. The case is included here in
                        // the remote chance that this gets fixed someday.

                        return String(value);

                        // If the type is 'object', we might be dealing with an object or an array or
                        // null.

                    case 'object':

                        // Due to a specification blunder in ECMAScript, typeof null is 'object',
                        // so watch out for that case.

                        if (!value) {
                            return 'null';
                        }

                        // Make an array to hold the partial results of stringifying this object value.

                        gap += indent;
                        partial = [];

                        // Is the value an array?

                        if (Object.prototype.toString.apply(value) === '[object Array]') {

                            // The value is an array. Stringify every element. Use null as a placeholder
                            // for non-JSON values.

                            length = value.length;
                            for (i = 0; i < length; i += 1) {
                                partial[i] = str(i, value) || 'null';
                            }

                            // Join all of the elements together, separated with commas, and wrap them in
                            // brackets.

                            v = partial.length === 0 ? '[]' : gap ?
                                '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                                '[' + partial.join(',') + ']';
                            gap = mind;
                            return v;
                        }

                        // If the replacer is an array, use it to select the members to be stringified.

                        if (rep && typeof rep === 'object') {
                            length = rep.length;
                            for (i = 0; i < length; i += 1) {
                                k = rep[i];
                                if (typeof k === 'string') {
                                    v = str(k, value);
                                    if (v) {
                                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                    }
                                }
                            }
                        } else {

                            // Otherwise, iterate through all of the keys in the object.

                            for (k in value) {
                                if (Object.hasOwnProperty.call(value, k)) {
                                    v = str(k, value);
                                    if (v) {
                                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                    }
                                }
                            }
                        }

                        // Join all of the member texts together, separated with commas,
                        // and wrap them in braces.

                        v = partial.length === 0 ? '{}' : gap ?
                            '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                            '{' + partial.join(',') + '}';
                        gap = mind;
                        return v;
                }
            }

            // If the JSON object does not yet have a stringify method, give it one.

            if (typeof JSON.stringify !== 'function') {
                JSON.stringify = function(value, replacer, space) {

                    // The stringify method takes a value and an optional replacer, and an optional
                    // space parameter, and returns a JSON text. The replacer can be a function
                    // that can replace values, or an array of strings that will select the keys.
                    // A default replacer method can be provided. Use of the space parameter can
                    // produce text that is more easily readable.

                    var i;
                    gap = '';
                    indent = '';

                    // If the space parameter is a number, make an indent string containing that
                    // many spaces.

                    if (typeof space === 'number') {
                        for (i = 0; i < space; i += 1) {
                            indent += ' ';
                        }

                        // If the space parameter is a string, it will be used as the indent string.

                    } else if (typeof space === 'string') {
                        indent = space;
                    }

                    // If there is a replacer, it must be a function or an array.
                    // Otherwise, throw an error.

                    rep = replacer;
                    if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                            typeof replacer.length !== 'number')) {
                        throw new Error('JSON.stringify');
                    }

                    // Make a fake root object containing our value under the key of ''.
                    // Return the result of stringifying the value.

                    return str('', {
                        '': value
                    });
                };
            }


            // If the JSON object does not yet have a parse method, give it one.

            if (typeof JSON.parse !== 'function') {
                JSON.parse = function(text, reviver) {

                    // The parse method takes a text and an optional reviver function, and returns
                    // a JavaScript value if the text is a valid JSON text.

                    var j;

                    function walk(holder, key) {

                        // The walk method is used to recursively walk the resulting structure so
                        // that modifications can be made.

                        var k, v, value = holder[key];
                        if (value && typeof value === 'object') {
                            for (k in value) {
                                if (Object.hasOwnProperty.call(value, k)) {
                                    v = walk(value, k);
                                    if (v !== undefined) {
                                        value[k] = v;
                                    } else {
                                        delete value[k];
                                    }
                                }
                            }
                        }
                        return reviver.call(holder, key, value);
                    }


                    // Parsing happens in four stages. In the first stage, we replace certain
                    // Unicode characters with escape sequences. JavaScript handles many characters
                    // incorrectly, either silently deleting them, or treating them as line endings.

                    text = String(text);
                    cx.lastIndex = 0;
                    if (cx.test(text)) {
                        text = text.replace(cx, function(a) {
                            return '\\u' +
                                ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        });
                    }

                    // In the second stage, we run the text against regular expressions that look
                    // for non-JSON patterns. We are especially concerned with '()' and 'new'
                    // because they can cause invocation, and '=' because it can cause mutation.
                    // But just to be safe, we want to reject all unexpected forms.

                    // We split the second stage into 4 regexp operations in order to work around
                    // crippling inefficiencies in IE's and Safari's regexp engines. First we
                    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                    // replace all simple value tokens with ']' characters. Third, we delete all
                    // open brackets that follow a colon or comma or that begin the text. Finally,
                    // we look to see that the remaining characters are only whitespace or ']' or
                    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                    if (/^[\],:{}\s]*$/
                        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                        // In the third stage we use the eval function to compile the text into a
                        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                        // in JavaScript: it can begin a block or an object literal. We wrap the text
                        // in parens to eliminate the ambiguity.

                        j = eval('(' + text + ')');

                        // In the optional fourth stage, we recursively walk the new structure, passing
                        // each name/value pair to a reviver function for possible transformation.

                        return typeof reviver === 'function' ?
                            walk({
                                '': j
                            }, '') : j;
                    }

                    // If the text is not JSON parseable, then a SyntaxError is thrown.

                    throw new SyntaxError('JSON.parse');
                };
            }
        }());
    })(Realtime.JSON = Realtime.JSON || {});
})(window.Realtime = window.Realtime || {});
// CONNECTION
(function(Realtime, undefined) {
    (function(Messaging, undefined) {

        /**
         *   @class Realtime.Messaging.Channel A logical path through which information is exchanged in an isolated way. Only users subscribing a certain channel will receive the information being broadcasted through it.
         */
        /**
         *   @property {String} Realtime.Messaging.Channel.name Name of the channel.
         */
        /**
         *   @property {Boolean} Realtime.Messaging.Channel.subscribeOnReconnect Indicates if the channels subscription is automatically made in case there's a reconnect. {@default true}
         */
        /**
         *   @property {Boolean} Realtime.Messaging.Channel.subscribe Indicates if the channel is to be subscribed as soon as it's added to the connection. {@default true}
         */
        /**
         *   @property {Function} Realtime.Messaging.Channel.onMessage Event handler raised when a message arrives through the channel.
         */
        /**
         *   @property {Function} Realtime.Messaging.Channel.onSubscribe Event handler raised when the channel subscribes to the connection. Starts listening for incoming messages.
         */
        /**
         *   @property {Function} Realtime.Messaging.Channel.onUnsubscribe Event handler raised when a channel unsubscribes from the connection. Stops listening for incoming messages.
         */
        /**
         *   @property {Function} Realtime.Messaging.Channel.messageAdapter Callback handler that allow changes to be made to the message. Useful to convert a message from an unknown source into an xRTML message. Called when a message arrives through the channel.
         */

        /**
         *   @class Realtime.Messaging.Connection Represents a connection to the Realtime server.
         */
        Messaging.Connection = function(args) {

            var ortcClient = null;
            var active = true;

            Realtime.Event.extend(this);
            /**
             *   @property {String} Realtime.Messaging.Connection.internalId Identification of the connection, generated automatically.
             */
            this.internalId = Realtime.Util.guidGenerator();
            /**
             *   @property {String} Realtime.Messaging.Connection.id Identification of the connection assigned by the user.
             */
            this.id = args.id || this.internalId;
            /**
             *   @property {String} Realtime.Messaging.Connection.appKey Identifies the application using the Realtime API.
             */
            this.appKey = args.appKey;
            /**
             *   @property {String} Realtime.Messaging.Connection.authToken Identifies a user belonging to the application using the Realtime API.
             */
            this.authToken = args.authToken;
            /**
             *   @property {Number} Realtime.Messaging.Connection.sendRetries Number of times a connection should try to send a message in case the first attempt fails. {@default 5}
             */
            this.sendRetries = parseInt(args.sendRetries, 10) || 5;
            /**
             *   @property {Number} Realtime.Messaging.Connection.sendInterval Period of time, in miliseconds, between message send retries made by the connection. {@default 1000 ms}
             */
            this.sendInterval = parseInt(args.sendInterval, 10) || 1000;
            /**
             *  @property {Number} Realtime.Messaging.Connection.timeout Period of time in miliseconds between connection attempts. {@default 10000 ms}
             */
            this.timeout = parseInt(args.timeout, 10) || 10000;
            /**
             *  @property {Number} Realtime.Messaging.Connection.connectAttempts Number of tries a connection should attempt to be established. {@default 5}
             */
            this.connectAttempts = parseInt(args.connectAttempts, 10) || 5;
            /**
             *  @property {Number} Realtime.Messaging.Connection.connectionAttemptsCounter Number of connection attempts that have been made. Connection attemps stop after it reaches the value specified in connectionAttempts.
             */
            this.connectionAttemptsCounter = 0;
            /**
             *  @property {Boolean} Realtime.Messaging.Connection.autoConnect Indicates if a connection should be established implicitly after it's created. {@default true}
             */
            this.autoConnect = typeof args.autoConnect == 'boolean' ? args.autoConnect : true;
            /**
             *  @property {Object} Realtime.Messaging.Connection.metadata Provides information related with the connection itself. The information is stored as a string.
             */
            this.metadata = args.metadata;
            /**
             *  @property {String} Realtime.Messaging.Connection.serverType Tells which realtime library should be used by the Realtime client. {@default IbtRealTimeSJ}
             */
            this.serverType = args.serverType || 'IbtRealTimeSJ';
            /**
             *  @property {String} Realtime.Messaging.Connection.url Path to the location of the real-time comunication server is located.
             */
            this.url = args.url;
            /**
             *  @property {Boolean} Realtime.Messaging.Connection.isCluster Indicates if connection should be made to a cluster server. {@default true}
             */
            this.isCluster = typeof args.isCluster == "boolean" ? args.isCluster : true;
            /**
             *  @property {String} Realtime.Messaging.Connection.announcementSubChannel The name of the announcement subchannel. Defining and subscribing to an announcement sub channel allows monitoring a single or set of users' Realtime Messaging related activities.
             */
            this.announcementSubChannel = args.announcementSubChannel;
            /**
             *  @property {Object} Realtime.Messaging.Connection.channels Contains all the existing channels in the connection.
             */
            this.channels = {};

            var proxy = Realtime.Util.proxy;
            var toFunction = Realtime.Util.parse;
            /**
             *   @property {Function} Realtime.Messaging.Connection.messageAdapter Function that allows changes to be made to a message prior to it being processed by a tag. Useful to convert a message from an unknown source into an xRTML message. Called when a message arrives through any channel subscribed to this connection.
             */
            this.messageAdapter = toFunction(args.messageAdapter, 'message');

            this.bind({
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onCreate Event handler raised when the connection is created.
                 */
                /**
                 *  Fired when the connection is created.
                 *  @event Realtime.Messaging.Connection.evt_create
                 *  @param {Object} e struture with the definition of the event's parameters.
                 */
                create: toFunction(args.onCreate, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onConnect Event handler raised when the connection is established.
                 */
                /**
                 *  Fired when the connection is established.
                 *  @event Realtime.Messaging.Connection.evt_connect
                 *  @param {Object} e struture with the definition of the event's parameters.
                 */
                connect: toFunction(args.onConnect, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onChannelCreate Event handler raised when a channel is added to the connection.
                 */
                /**
                 *  Fired when a channel is added to the connection.
                 *  @event Realtime.Messaging.Connection.evt_channelCreate
                 *  @param {Realtime.Messaging.Channel} channel struture with the channel's definition.
                 */
                channelCreate: toFunction(args.onChannelCreate, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onDisconnect Event handler raised when there's a disconnection from the Realtime server.
                 */
                /**
                 *  Fired when there's a disconnection from the Realtime server.
                 *  @event Realtime.Messaging.Connection.evt_disconnect
                 *  @param {Object} e struture with the definition of the event's parameters.
                 */
                disconnect: toFunction(args.onDisconnect, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onSubscribe Event handler raised when the connection subscribes a channel.
                 */
                /**
                 *  Fired when the connection has subscribed to a channel.
                 *  @event Realtime.Messaging.Connection.evt_subscribe
                 *  @param {Object} e struture with the definition of the event's parameters.
                 *  @... {String} channel name of the subscribed channel.
                 */
                subscribe: toFunction(args.onSubscribe, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onUnsubscribe Event handler raised when the connection unsubscribes a channel.
                 */
                /**
                 *  Fired when the connection has unsubscribed a channel.
                 *  @event Realtime.Messaging.Connection.evt_unsubscribe
                 *  @param {Object} e struture with the definition of the event's parameters.
                 *  @... {String} channel name of the unsubscribed channel.
                 */
                unsubscribe: toFunction(args.onUnsubscribe, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onException Event handler raised when an Realtime related exception has occurred.
                 */
                /**
                 *  Fired when an Realtime related exception has occurred.
                 *  @event Realtime.Messaging.Connection.evt_exception
                 *  @param {Object} e struture with the definition of the event's parameters.
                 *  @... {String} message description of the raised exception.
                 */
                exception: toFunction(args.onException, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onReconnect Event handler raised when a connection to an Realtime server is reestablished.
                 */
                /**
                 *  Fired when a connection to an Realtime server is reestablished.
                 *  @event Realtime.Messaging.Connection.evt_reconnect
                 *  @param {Object} e struture with the definition of the event's parameters.
                 */
                reconnect: toFunction(args.onReconnect, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onReconnecting Event handler raised when a connection to an Realtime server is in the process of being reestablished.
                 */
                /**
                 *  Fired when a connection to an Realtime server is in the process of being reestablished.
                 *  @event Realtime.Messaging.Connection.evt_reconnecting
                 *  @param {Object} e struture with the definition of the event's parameters.
                 */
                reconnecting: toFunction(args.onReconnecting, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onMessage Event handler raised when a connection receives a message through a subscribed channel.
                 */
                /**
                 *  Fired when a connection receives a message through a subscribed channel.
                 *  @event Realtime.Messaging.Connection.evt_message
                 *  @param {Object} e struture with the definition of the event's parameters.
                 *  @... {String} channel name of the subscribed channel from where the message was received.
                 *  @... {String} message message that was received.
                 */
                message: toFunction(args.onMessage, 'e'),
                /**
                 *  @property {Function} Realtime.Messaging.Connection.onDispose Event handler raised when a connection is disposed.
                 */
                /**
                 *  Fired when a connection is disposed.
                 *  @event Realtime.Messaging.Connection.evt_dispose
                 *  @param {Object} e struture with the definition of the event's parameters.
                 */
                dispose: toFunction(args.onDispose, 'e')
            });

            var onMessage = proxy(function(client, channel, message) {
                this.process({
                    channel: channel,
                    message: message
                });
            }, this);

            var onFactoryLoaded = function(e) {
                ortcClient = e.createClient();
                ortcClient.setId(this.internalId);
                ortcClient.setConnectionTimeout(this.timeout);
                ortcClient.setConnectionMetadata(typeof this.metadata == 'object' ? Realtime.JSON.stringify(this.metadata) : this.metadata);
                ortcClient.setAnnouncementSubChannel(this.announcementSubChannel);

                !this.isCluster ? ortcClient.setUrl(this.url) : ortcClient.setClusterUrl(this.url);

                ortcClient.onConnected = proxy(function(ortcClient) {
                    for (var name in this.channels) {
                        var channel = this.channels[name];
                        if (channel.subscribe) {
                            ortcClient.subscribe(channel.name, channel.subscribeOnReconnect, onMessage);
                        }
                    }
                    this.fire({
                        connect: {}
                    });
                }, this);

                ortcClient.onDisconnected = proxy(function(ortcClient) {
                    this.fire({
                        disconnect: {}
                    });
                }, this);

                ortcClient.onSubscribed = proxy(function(ortcClient, channel) {
                    this.channels[channel].fire({
                        subscribe: {}
                    });
                    this.fire({
                        subscribe: {
                            channel: channel
                        }
                    });

                }, this);

                ortcClient.onUnsubscribed = proxy(function(ortcClient, channel) {
                    var removedChannel = this.channels[channel];
                    delete this.channels[channel];
                    removedChannel.fire({
                        unsubscribe: {}
                    });
                    this.fire({
                        unsubscribe: {
                            channel: channel
                        }
                    });

                }, this);

                ortcClient.onException = proxy(function(ortcClient, evt) {
                    this.fire({
                        exception: {
                            message: evt
                        }
                    });
                }, this);

                ortcClient.onReconnected = proxy(function(ortcClient) {
                    this.connectionAttemptsCounter = 0;
                    this.fire({
                        reconnect: {}
                    });
                }, this);

                ortcClient.onReconnecting = proxy(function(ortcClient) {
                    if (this.connectionAttemptsCounter >= this.connectAttempts) {
                        ortcClient.disconnect();
                    } else {
                        this.connectionAttemptsCounter++;
                        this.fire({
                            reconnecting: {}
                        });
                    }
                }, this);

                this.fire({
                    create: {}
                });

                if (this.autoConnect) {
                    ortcClient.connect(this.appKey, this.authToken);
                }
            };

            var retrySend = function(args, retries) {
                if (this.isCreated() && this.isConnected()) {
                    this.send(args);
                } else {
                    if (++retries <= this.sendRetries) {
                        setTimeout(proxy(function() {
                            proxy(retrySend, this)(args, retries);
                        }, this), this.sendInterval);
                    }
                }
            };
            /**
             *  @function {public} Realtime.Messaging.Connection.active Gets or sets the active state of the connection.
             *  @param {optional Boolean} value The new active state.
             */
            this.active = function(value) {
                if (typeof value == "boolean") {
                    active = value;
                }
                return active;
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.dispose Disconnects and removes references to this Connection.
             */
            this.dispose = function() {
                if (this.isConnected()) {
                    this.disconnect();
                }
                this.fire({
                    dispose: {}
                });
            };
            /**
             *  @function {Realtime.Messaging.Channel} Realtime.Messaging.Connection.createChannel Adds, but doesn't subscribe, a channel to the connection.
             *  @param {Realtime.Messaging.Channel} c The channel to be added.
             *  @returns The created channel.
             */
            this.createChannel = function(c) {

                if (!c) {
                    this.fire({
                        exception: {
                            message: "No channel to create."
                        }
                    });
                    return null;
                }

                if ( !! this.channels[c.name]) {
                    return this.channels[c.name];
                }

                var channel = {
                    name: c.name,
                    subscribeOnReconnect: typeof c.subscribeOnReconnect == "boolean" ? c.subscribeOnReconnect : true,
                    subscribe: typeof c.subscribe == 'boolean' ? c.subscribe : true,
                    messageAdapter: toFunction(c.messageAdapter, 'message')
                };

                Realtime.Event.extend(channel);

                channel.bind({
                    /**
                     *  Fired when a subscribed channel receives a message.
                     *  @event Realtime.Messaging.Channel.evt_message
                     *  @param {Object} e struture with the definition of the event's parameters.
                     *  @... {String} message message that was received.
                     */
                    message: toFunction(c.onMessage, 'e'),
                    /**
                     *  Fired when a channel subscribes to the connection. Starts listening for incoming messages.
                     *  @event Realtime.Messaging.Channel.evt_subscribe
                     *  @param {Object} e struture with the definition of the event's parameters.
                     *  @... {String} message message that was received.
                     */
                    subscribe: toFunction(c.onSubscribe, 'e'),
                    /**
                     *  Fired when a channel unsubscribes from the connection. Stops listening for incoming messages.
                     *  @event Realtime.Messaging.Channel.evt_unsubscribe
                     *  @param {Object} e struture with the definition of the event's parameters.
                     *  @... {String} message message that was received.
                     */
                    unsubscribe: toFunction(c.onUnsubscribe, 'e')
                });

                this.channels[c.name] = channel;

                this.fire({
                    channelCreate: {
                        channel: channel
                    }
                });

                return channel;
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.process Receive and process the messages that arrive through the subscribed channels.
             *  @param {Object} data structure with the message attributes.
             *  @... {String} channel Name of the channel from where the message arrived.
             *  @... {String} message The received message.
             */
            this.process = function(data) {
                var channel = data.channel;
                var message = data.message;

                //Check if the message should be discarded.
                if (message.substring(0, 15) == '_X_SEND_ONLY_X_') {
                    if (this.internalId == message.substring(15, 51)) {
                        return;
                    }
                    message = message.substring(54);
                }

                if (this.active()) {

                    Realtime.Util.series([

                        Realtime.Util.proxy(function(callback) {

                            if (this.messageAdapter) {
                                message = this.messageAdapter(message);
                            }

                            callback();

                        }, this),

                        Realtime.Util.proxy(function(callback) {

                            this.fire({
                                message: {
                                    channel: channel,
                                    message: message
                                }
                            });

                            callback();

                        }, this)
                    ]);

                    if (this.channels[channel]) {

                        Realtime.Util.series([

                            Realtime.Util.proxy(function(callback) {

                                if (this.channels[channel].messageAdapter) {
                                    message = this.channels[channel].messageAdapter(message);
                                }

                                callback();

                            }, this),

                            Realtime.Util.proxy(function(callback) {

                                this.channels[channel].fire({
                                    message: {
                                        message: message
                                    }
                                });

                                callback();

                            }, this)
                        ]);

                    }
                }
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.send Transmits a message through a channel.
             *  @param {Object} args structure with the message attributes.
             *  @... {String} channel Name of the channel through which we're sending the message.
             *  @... {Object} content The message to be sent through the channel.
             *  @... {Boolean} sendOnly Identifies if the message should be sent and discarded by the connection that sends it.
             */
            this.send = function(args) {
                var channel = args.channel;
                var content = args.content;

                if (this.isCreated() && this.isConnected()) {
                    if (this.active()) {

                        var msg = typeof content === "object" ? Realtime.JSON.stringify(content) : content;

                        if (args.sendOnly) {
                            msg = '_X_SEND_ONLY_X_' + this.internalId + '_X_' + msg;
                        }

                        ortcClient.send(channel, msg);
                    }
                } else {
                    setTimeout(proxy(function() {
                        proxy(retrySend, this)(args, 0);
                    }, this), this.sendInterval);
                }
                return;
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.connect Establishes the connection to the Realtime server.
             *  @param {Object} credentials structure with the credentials properties.
             *  @... {String} appKey Realtime application key.
             *  @... {String} authToken Realtime authentication token. Identifies a user using the application.
             */
            this.connect = function(credentials) {
                if (this.isCreated()) {
                    if (credentials) {
                        this.appKey = credentials.appKey;
                        this.authToken = credentials.authToken;
                    }
                    ortcClient.connect(this.appKey, this.authToken);
                }
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.disconnect Closes the connection to the Realtime server.
             */
            this.disconnect = function() {
                if (this.isConnected()) {
                    ortcClient.disconnect();
                } else {
                    this.fire({
                        exception: {
                            message: "Already disconnected."
                        }
                    });
                }
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.subscribe Adds and subscribes a channel to the connection.
             *  @param {Realtime.Messaging.Channel} channel The Channel to subscribe.
             */
            this.subscribe = function(channel) {
                if (!this.channels[channel.name]) {
                    channel = this.createChannel(channel);
                }
                ortcClient.subscribe(this.channels[channel.name].name, this.channels[channel.name].subscribeOnReconnect, onMessage);
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.unsubscribe Unsubscribes a channel from the connection.
             *  @param {String} name Name of the channel.
             */
            this.unsubscribe = function(name) {
                ortcClient.unsubscribe(name);
            };
            /**
             *  @function {Boolean} Realtime.Messaging.Connection.isCreated Checks if the connection is initialized.
             *  @returns A boolean stating if the connection is initialized.
             */
            this.isCreated = function() {
                return ortcClient != null;
            };
            /**
             *  @function {Boolean} Realtime.Messaging.Connection.isConnected Checks if the connection to the Realtime server is established.
             *  @returns A boolean stating if the connection is established.
             */
            this.isConnected = function() {
                return this.isCreated() ? ortcClient.getIsConnected() : false;
            };
            /**
             *  @function {Boolean} Realtime.Messaging.Connection.isSubscribed Checks if the connection has subscribed the channel.
             *  @param {String} channel Name of the channel.
             *  @returns A boolean stating if the channel is subscribed.
             */
            this.isSubscribed = function(channel) {
                return this.isConnected() ? ortcClient.isSubscribed(channel) : false;
            };
            /**
             *  @function {String} Realtime.Messaging.Connection.getMetadata Gets the information related to the connection.
             *  @returns The information related to the connection
             */
            this.getMetadata = function() {
                if (this.isCreated()) {
                    try {
                        return Realtime.JSON.parse(ortcClient.getConnectionMetadata());
                    } catch (e) {
                        return ortcClient.getConnectionMetadata();
                    }
                }
                return null;
            };
            /**
             *  @function {void} Realtime.Messaging.Connection.setMetadata Associates information about the connection. The metadata is only set before the connection is established and updated after a reconnect.
             *  @param {String} metadata Information to store.
             */
            this.setMetadata = function(metadata) {
                if (this.isCreated()) {
                    ortcClient.setConnectionMetadata(typeof metadata == 'object' ? Realtime.JSON.stringify(metadata) : metadata);
                    this.metadata = metadata;
                }
            };
            /**
             *  @function {String} Realtime.Messaging.Connection.getAnnouncementSubChannel Gets the client announcement subchannel.
             *  @returns The name of announcement subchannel
             */
            this.getAnnouncementSubChannel = function() {
                return this.isCreated() ? ortcClient.getAnnouncementSubChannel() : null;
            };
            /**
             *  @function {String} Realtime.Messaging.Connection.getProtocol Gets the protocol used in Realtime clients to communicate between each other.
             *  @returns The name of announcement subchannel
             */
            this.getProtocol = function() {
                return this.isConnected() ? ortcClient.getProtocol() : null;
            };
            /**
             *  @function {String} Realtime.Messaging.Connection.setProtocol Sets the protocol used in Realtime connections to communicate between each other. Most be set before a connection is established.
             *  @returns The name of announcement subchannel
             */
            this.setProtocol = function(name) {
                if (this.isCreated()) {
                    ortcClient.setProtocol(name);
                }
            };

            if (window.loadOrtcFactory) {
                loadOrtcFactory(this.serverType, proxy(onFactoryLoaded, this));
            } else {
                Realtime.Messaging.ready(
                    proxy(function() {
                        proxy(loadOrtcFactory, this)(this.serverType, proxy(onFactoryLoaded, this));
                    }, this)
                );
            }

            if (args.channels && Object.prototype.toString.call(args.channels) === '[object Array]') {
                var chs = args.channels;
                for (var i = 0; i < chs.length; ++i) {
                    this.createChannel(chs[i]);
                }
            }
        };
    })(Realtime.Messaging = Realtime.Messaging || {});
})(window.Realtime = window.Realtime || {});
//CONNECTION MANAGER
(function(Realtime, undefined) {
    (function(Messaging, undefined) {
        /**
         *   @class Realtime.Messaging.ConnectionManager Provides access to a data layer that manages the creation and dispose of connections, transmission and retrieval of information between the connections and the Realtime Framework servers.
         */
        (function(ConnectionManager, undefined) {
            Realtime.Event.extend(ConnectionManager);
            /**
             *   @property {Array} Realtime.Messaging.ConnectionManager.Connections [ARRAY]The array where all of the connections ids are stored.
             */
            ConnectionManager.Connections = [];

            var connections = {};

            var getById = function(id) {
                for (var key in connections) {
                    if (connections[key].id === id) {
                        return connections[key];
                    }
                }
                return undefined;
            };

            var messageBuffer = {
                add: function(args) {
                    var id = args.connection.id;
                    if (!this.bConnections[id]) {
                        this.bConnections[id] = [];
                        args.connection.bind({
                            connect: this.send
                        });
                    }
                    this.bConnections[id].push(args.message);
                },
                bConnections: {},
                send: function(e) {
                    var messages = messageBuffer.bConnections[this.id];
                    var con = this;

                    for (var i = 0; i < messages.length; ++i) {
                        con.send(messages[i]);
                    }

                    con.unbind({
                        connect: messageBuffer.send
                    });
                    messageBuffer.bConnections[this.id] = undefined;
                }
            };
            /**
             *   @function {public Realtime.Messaging.Connection} Realtime.Messaging.ConnectionManager.create Creates a new connection. {@code: ConnectionManager\create.js}
             *   @param {Object} connection structure with the connection attributes.
             *   @... {optional String} id Connection's identification.
             *   @... {optional String} appKey Identifies the application using the Realtime API. Optional only if attribute 'autoConnect' is set to false.
             *   @... {optional String} authToken Identifies a user belonging to the application using the Realtime API. Optional only if attribute 'autoConnect' is set to false.
             *   @... {optional Number} sendRetries Number of times a connection should try to send a message in case the first attempt fails.
             *   @... {optional Number} sendInterval Period of time in miliseconds between message send retries by the connection.
             *   @... {optional Number} timeout Maximum amount of time (miliseconds) a connection tag should take to perform a connect.
             *   @... {optional Number} connectAttempts Number of times a connection should try to issue a connect.
             *   @... {optional Boolean} autoConnect Indicates if a connection should be established implicitly after it's created. Defaults to true.
             *   @... {optional String} metadata Provides information about one or more aspects of the data associated with the connection.
             *   @... {optional String} serverType Tells which library to be used by the Realtime Messaging client. Defaults to 'IbtRealTimeSJ'.
             *   @... {optional String} url Path to the location of the real-time comunication server is located. Optional if attribute 'autoConnect' is set to false.
             *   @... {optional Boolean} isCluster Indicates if connection should be made to a cluster server. Default is true.
             *   @... {optional Channel} channels [ARRAY]Array of channels to be added to the connection.
             *   @... {optional Function} onCreate Event handler raised when the connection is created.
             *   @... {optional Function} onConnect Event handler raised when a connection is successfully established.
             *   @... {optional Function} onDisconnect Event handler raised when the connection has lost comunication with the Online Realtime Communication (Realtime) server.
             *   @... {optional Function} onSubscribe Event handler raised when a channel is subscribed.
             *   @... {optional Function} onUnsubscribe Event handler raised when a channel is unsubscribed.
             *   @... {optional Function} onException Event handler raised when there's an error performing Realtime Messaging Connection related operations.
             *   @... {optional Function} onReconnect Event handler raised when there's a reconnection to the Realtime servers.
             *   @... {optional Function} onReconnecting Event handler raised when a reconnection to the Realtime servers is under way.
             *   @... {optional Function} onMessage Event handler raised when a message arrives through any channel subscribed in this connection.
             *   @... {optional Function} messageAdapter Callback method that allow changes to be made to the message. Called when a message arrives through any channel subscribed in this connection.
             *   @returns The newly created xRTML Connection.
             */
            ConnectionManager.create = function(connection) {
                return this.add(new Realtime.Messaging.Connection(connection));
            };
            /**
             *   @function {public Realtime.Messaging.Connection} Realtime.Messaging.ConnectionManager.add Adds a unique Realtime Connection to the Realtime Messaging platform.
             *   @param {Realtime.Messaging.Connection} connection Realtime Connection object.
             *   @returns The added Realtime Connection.
             */
            ConnectionManager.add = function(connection) {

                if (this.getById(connection.id)) {
                    return null;
                }

                this.Connections.push(connection.id);
                connections[connection.internalId] = connection;

                this.fire({
                    create: {
                        connection: connection
                    }
                });

                connection.bind({
                    message: function(e) {
                        ConnectionManager.fire({
                            message: {
                                connection: this,
                                channel: e.channel,
                                message: e.message
                            }
                        });
                    }
                });

                connection.bind({
                    dispose: function(e) {

                        var connectionInternalId = this.internalId;
                        var disposedConnection = connections[connectionInternalId];

                        connections[connectionInternalId] = null;
                        delete connections[connectionInternalId];

                        for (var i = 0, cons = ConnectionManager.Connections, len = cons.length; i < len; i++) {
                            if (cons[i] === this.id) {
                                cons.splice(i, 1);
                                break;
                            }
                        }

                        ConnectionManager.fire({
                            dispose: {
                                connection: this
                            }
                        });
                    }
                });

                return connection;
            };
            /**
             *   @function {public Realtime.Messaging.Connection} Realtime.Messaging.ConnectionManager.getById Gets a connection by its internal or user given id.
             *   @param {String} id The id of the intended connection.
             *   @returns The connection with the given id.
             */
            ConnectionManager.getById = function(id) {
                return connections[id] || getById(id);
            };
            /**
             *   @function {public void} Realtime.Messaging.ConnectionManager.dispose Removes all references of the specified Connection.
             *   @param {String} id The id of the intended connection.
             */
            ConnectionManager.dispose = function(id) {
                var connection = this.getById(id);

                if (connection) {
                    connection.dispose();
                }

                return !!connection;
            };
            /**
             *   @function {public void} Realtime.Messaging.ConnectionManager.addChannel Adds a channel to a connection.
             *   @param {Object} channel structure with the channel definition.
             *   @... {String} name The name of the channel.
             *   @... {optional Boolean} subscribeOnReconnect Defines if the channel is to be subscribed after a reconnect.
             *   @... {optional Boolean} subscribe Defines if the channel is to be subscribed as soon as the connection is established.
             *   @... {optional Function} messageAdapter Callback method that allow changes to be made to the message. Called when a message arrives through any channel subscribed in this connection.
             *   @... {optional Function} onMessage Event handler raised when a message arrives through the channel.
             *   @... {optional Function} onSubscribe Event handler raised when the channel is subscribed.
             *   @... {optional Function} onUnsubscribe Event handler raised when the channel is unsubscribed.
             */
            ConnectionManager.addChannel = function(channel) {
                var connection = this.getById(channel.connectionId);

                if ( !! connection) {
                    connection.createChannel(channel);
                }

                return !!connection;
            };
            /**
             *   @function {public void} Realtime.Messaging.ConnectionManager.sendMessage Sends a message through the specified connections and channel. {@code: ConnectionManager\sendMessage.js}
             *   @param {Object} message struture with the definition of the message.
             *   @... {String} connections [ARRAY]Ids of the connections.
             *   @... {String} channel Name of the channel.
             *   @... {Object} content Message to be sent.
             *   @... {optional Boolean} sendOnly Identifies if the message should be sent and discarded by the connection that sends it.
             */
            ConnectionManager.sendMessage = function(message) {
                var connection;

                for (var i = 0; i < message.connections.length; ++i) {

                    connection = this.getById(message.connections[i]);

                    if (connection) {
                        if (connection.isConnected()) {
                            connection.send(message);
                        } else {
                            messageBuffer.add({
                                connection: connection,
                                message: {
                                    channel: message.channel,
                                    content: message.content,
                                    sendOnly: message.sendOnly
                                }
                            });
                        }
                    }
                }
            };
        })(Realtime.Messaging.ConnectionManager = Realtime.Messaging.ConnectionManager || {});
    })(Realtime.Messaging = Realtime.Messaging || {});
})(window.Realtime = window.Realtime || {});
// TRACE MONITOR
(function(Realtime, undefined) {
    (function(Messaging, undefined) {
        /**
         *   @class Realtime.Messaging.TraceMonitor Monitors the flow of messages and connection operations by logging messages to the web-browser console. Should only be enabled for development or debugging purposes.
         */
        (function(TraceMonitor, undefined) {
            /**
             *   @property {Boolean} Realtime.Messaging.TraceMonitor.active Tells if the TraceMonitor is active.
             */
            TraceMonitor.active = false;

            var Logger = (function() {

                if (typeof console !== "undefined") {
                    return console;
                }

                var fallback = {
                    log: function() {},
                    debug: function() {},
                    info: function() {},
                    warn: function() {},
                    error: function() {}
                };

                return fallback;
            })();

            Realtime.Messaging.ConnectionManager.bind({
                create: function(evt) {

                    evt.connection.bind({

                        create: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + " created. " + (this.autoConnect ? "Connecting..." : "Waiting for explicit connect...");
                                Logger.log(statement);
                            }
                        },

                        connect: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + " established. Using " + this.getProtocol() + " protocol.";
                                Logger.log(statement);
                            }
                        },
                        disconnect: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + " closed.";
                                Logger.log(statement);
                            }
                        },
                        subscribe: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + ": Channel " + e.channel + " subscribed.";
                                Logger.log(statement);
                            }
                        },
                        unsubscribe: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + ": Channel " + e.channel + " unsubscribed.";
                                Logger.log(statement);
                            }
                        },
                        exception: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + " threw an exception: " + e.message;
                                Logger.log(statement);
                            }
                        },
                        reconnect: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + " is restored. Using " + this.getProtocol() + " protocol.";
                                Logger.log(statement);
                            }
                        },
                        reconnecting: function(e) {
                            if (TraceMonitor.active) {
                                var statement = "Connection " + this.id + " was lost. ";
                                if (this.connectionAttemptsCounter >= this.connectAttempts) {
                                    statement += "Maximum number of attempts reached: " + this.connectAttempts + " Stop trying to reconnect.";
                                } else {
                                    statement += "Trying to reconnect. Attempt " + this.connectionAttemptsCounter + " out of " + this.connectAttempts;
                                }
                                Logger.log(statement);
                            }
                        },
                        message: function(e) {
                            if (TraceMonitor.active) {
                                var info = "Connection " + this.id + ": Message received from channel " + e.channel;
                                var statement;
                                try {
                                    statement = Realtime.JSON.parse(e.message);
                                } catch (err) {
                                    statement = e.message;
                                }
                                Logger.log(info);
                                Logger.log(statement);
                            }
                        }
                    });
                }
            });

        })(Realtime.Messaging.TraceMonitor = Realtime.Messaging.TraceMonitor || {});
    })(Realtime.Messaging = Realtime.Messaging || {});
})(window.Realtime = window.Realtime || {});
// INIT
(function(Realtime, undefined) {
    var init = function() {
        Realtime.Messaging.isReady = true;

        Realtime.Messaging.fire({
            ready: {}
        });
    };

    if (typeof loadOrtcFactory == "undefined") {
        Realtime.Util.loadScript(document.location.protocol == "file:" ? "http://dfdbz2tdq3k01.cloudfront.net/js/2.1.0/ortc.js" : document.location.protocol + '//dfdbz2tdq3k01.cloudfront.net/js/2.1.0/ortc.js', init);
    } else {
        init();
    }
})(window.Realtime = window.Realtime || {});
// REQUEST
(function(Realtime, undefined) {
    /*
     *   @class  Realtime.Request Contains methods for performing HTTP and HTTPS requests.
     */
    (function(Request, undefined) {

        var RequestEngine = function() {

            var self = this;

            Realtime.Event.extend(this);

            var Worker = function() {
                var self = this;
                var busy = false;

                this.work = function(repository) {
                    if (!busy) {
                        var job = repository.get();

                        if (job) {
                            busy = true;

                            var data = {
                                method: job.item.method,
                                url: job.item.url,
                                data: job.item.parameters,
                                headers: job.item.headers,
                                crossDomain: job.item.crossDomain,
                                success: function(response) {
                                    if (typeof job.item.success == "function") {
                                        job.item.success(response);
                                    }
                                },
                                error: function(error) {
                                    if (typeof job.item.error == "function") {
                                        job.item.error(error);
                                    }
                                },
                                complete: function(result) {
                                    if (typeof job.item.complete == "function") {
                                        job.item.complete(result);
                                    }

                                    busy = false;
                                    self.work(repository);
                                }
                            };

                            if (job.item.path) {
                                data.url = data.url + job.item.path;
                            }

                            sendRequest(data);
                        }
                    }
                };
            };

            var queue = new Array();

            for (var i = 0; i < 6; i++) {
                var _worker = new Worker();
                this.bind({
                    item: function(e) {
                        _worker.work(self);
                    }
                });
            };

            this.set = function(args) {
                queue.push({
                    item: args
                });
                this.fire({
                    'item': this
                });
            };

            this.get = function() {
                if (queue.length > 0) {
                    return queue.shift();
                } else {
                    return undefined;
                }
            };
        };

        var engine = new RequestEngine();

        var getTransportMethod = function(crossDomain) {
            // IE10 Chrome, FF, Opera, Safari
            if (typeof window.ArrayBuffer != "undefined" && window.XMLHttpRequest) return XHR();

            if (crossDomain) {
                // IE 9 and 8
                if (window.XDomainRequest) return XDR();

                return;
            }

            if (window.XMLHttpRequest) return XHR();

            return;
        };

        var sendRequest = function(args) {
            var transport = getTransportMethod(args.crossDomain);

            if (transport) {

                var rqArgs = {
                    method: args.method,
                    url: args.url,
                    callback: function(result, error, status) {

                        var res = {
                            error: null,
                            data: null
                        };

                        if (typeof error != 'undefined' && error != null) {
                            if (args.error) {
                                res.error = error;
                                args.error(res);
                            }
                        } else {
                            if (args.success) {
                                try {
                                    res = Realtime.JSON.parse(result);
                                } catch (e) {
                                    res = result;
                                }
                                args.success(res);
                            }
                        }

                        if (args.complete) {
                            args.complete(res);
                        }
                    },
                    headers: args.headers
                };

                transport.create(rqArgs);

                if (args.data) {
                    transport.send(args.data);
                } else {
                    transport.send();
                }
            }
        };

        var XHR = function() {
            return {
                create: function(args) {
                    var self = this;
                    this.xhr = new window.XMLHttpRequest();
                    this.callback = args.callback;

                    // handles state changes
                    this.xhr.onreadystatechange = function() {
                        if (self.xhr.readyState == 4) {
                            if (self.xhr.status == 200) {
                                self.callback(self.xhr.responseText, null, self.xhr.status);
                            } else if (self.xhr.status == 0) {
                                self.callback(null, 'The status code is 0 which likely means that the server is unavailable.', self.xhr.status);
                            } else {
                                self.callback(self.xhr.responseText);
                            }
                        }
                    };

                    // ADD TIMESTAMP TO URL

                    args.url = args.url + "?ts=" + (+new Date());

                    this.xhr.open(args.method, args.url, true);

                    if (args.headers) {
                        for (var prop in args.headers) {
                            this.xhr.setRequestHeader(prop, args.headers[prop]);
                        }
                    } else {
                        if (args.method != "GET") {
                            this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
                            this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                        }
                    }

                    return this;
                },
                send: function(data) {
                    if (data && typeof(data) != 'string') {
                        data = Realtime.JSON.stringify(data);
                        this.xhr.send(data);
                    } else {
                        this.xhr.send();
                    }
                }
            }
        };

        var XDR = function() {
            return {
                create: function(args) {
                    var self = this;
                    this.xdr = new window.XDomainRequest();
                    this.callback = args.callback;

                    this.xdr.onload = function() {
                        self.callback(self.xdr.responseText);
                    };

                    this.xdr.onerror = this.xdr.ontimeout = function() {
                        var message = self.xdr.responseText && self.xdr.responseText != "" ? self.xdr.responseText : "Cannot complete the request.";
                        self.callback(null, message, 500);
                    };

                    // ADD TS TO URL
                    args.url = args.url + "?ts=" + (+new Date());

                    this.xdr.open(args.method, args.url, true);

                    if (args.method != "GET") {
                        try {
                            this.xdr.contentType = "text/plain";
                        } catch (err) {}
                    }

                    return this;
                },
                send: function(data) {
                    var self = this;
                    if (data && typeof data != 'string') {
                        data = Realtime.JSON.stringify(data);
                        setTimeout(function() {
                            self.xdr.send(data);
                        }, 200);
                    } else {
                        setTimeout(function() {
                            self.xdr.send();
                        }, 200);
                    }

                }
            }
        };
        /*
         *   Performs a POST request.
         *   @param {Object} args Contains the arguments for this function.
         *   @... {String} url The URL for the request.
         *   @... {Object} data The data to send through the request.
         *   @... {Object} headers The headers to send in the request when possible (not supported for IE7, IE8 and Quirks). The name of the properties are the header name and the value the header value.
         *   @... {Function} success A function that will be called after the request returns a successful response.
         *   @... {Function} error A function that will be called after the request returns a erroneous response.
         *   @... {Function} complete A function that will always be called after the request returns any response. The params passed to this handler will be result, error, status (will only receive status when available in the request object)
         *   @... {optional Boolean} async Identifies if the request is asynchronous, defaults to Asynchronous
         *   @... {optional Boolean} crossDomain  Identifies if the request is to another domain. If this setting is enabled then the server-side controller should contain these headers: Content-Type: text/plain, Access-Control-Allow-Origin: *, Access-Control-Allow-Credentials: 'true', Access-Control-Allow-Methods: POST, OPTIONS, Access-Control-Max-Age: '60', Access-Control-Allow-Headers: X-Requested-With, Content-Type
         *   @function {public void} Realtime.Request.post
         */
        Request.post = function(args) {
            args.method = 'POST';
            engine.set(args);
        };
        /*
         *   Performs a GET request.
         *   @param {Object} args Contains the arguments for this function.
         *   @... {String} url The URL for the request.
         *   @... {Object} data The data to send through the request.
         *   @... {Object} headers The headers to send in the request when possible (not supported for IE7, IE8 and Quirks). The name of the properties are the header name and the value the header value.
         *   @... {Function} success A function that will be called after the request returns a successful response.
         *   @... {Function} error A function that will be called after the request returns a erroneous response.
         *   @... {Function} complete A function that will always be called after the request returns any response. The params passed to this handler will be result, error, status (will only receive status when available in the request object)
         *   @... {optional Boolean} async Identifies if the request is asynchronous, defaults to Asynchronous
         *   @... {optional Boolean} crossDomain  Identifies if the request is to another domain. If this setting is enabled then the server-side controller should contain these headers: Content-Type: text/plain, Access-Control-Allow-Origin: *, Access-Control-Allow-Credentials: 'true', Access-Control-Allow-Methods: GET, OPTIONS, Access-Control-Max-Age: '60', Access-Control-Allow-Headers: X-Requested-With, Content-Type
         *   @function {public void} Realtime.Request.get
         */
        Request.get = function(args) {
            args.method = 'GET';

            if (typeof args.data != 'undefined') {
                var url = args.url,
                    data = args.data;

                url += url.indexOf('?') == -1 ? '?' : '&';
                for (var prop in args.data) {
                    var propValue = data[prop];
                    // level of depth in the object = 1
                    if (typeof propValue != 'object' && typeof propValue != 'boolean') {
                        url += prop + '=' + propValue + '&';
                    }
                }

                // remove the last '&' but only if object had attributes
                if (url.lastIndexOf('&') == url.length - 1) {
                    url = url.slice(0, -1);
                }
                args.url = url;
            }
            engine.set(args);
        };

    })(window.Realtime.Request = window.Realtime.Request || {});
})(window.Realtime = window.Realtime || {});
// OPERATION
(function(Realtime, undefined) {
    (function(Storage, undefined) {

        var headers = {
            "Content-Type": "application/json; charset=utf-8"
        };

        var complete = function(response, retry, success, error) {
            if (response.error) {
                if (error) {
                    if (!retry && typeof response.error == "string" && response.error.match("unavailable") && response.error.match("status") && response.error.match("0") && response.error.match("server")) {
                        error({
                            error: response.error,
                            retry: true
                        });
                    } else {
                        error({
                            error: response.error,
                            retry: false
                        });
                    }
                }
            } else {
                if (success) {
                    success(response.data);
                }
            }
        };

        Storage.Operation = function(credentials) {
            this.credentials = credentials;

            this.setCredentials = function(data) {
                data.applicationKey = this.credentials.applicationKey;
                data.authenticationToken = this.credentials.authenticationToken;
                return data;
            };
        };

        Storage.Operation.prototype = {
            isAuthenticated: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/isAuthenticated",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.isAuthenticated(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            listItems: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/listItems",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.listItems(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            queryItems: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/queryItems",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.queryItems(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            getItem: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/getItem",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.getItem(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            putItem: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/putItem",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.putItem(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            updateItem: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/updateItem",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.updateItem(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            deleteItem: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/deleteItem",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.deleteItem(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            createTable: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/createTable",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.createTable(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            updateTable: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/updateTable",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.updateTable(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            deleteTable: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/deleteTable",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.deleteTable(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            listTables: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/listTables",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.listTables(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            },
            describeTable: function(data, success, error, retry) {
                var self = this;
                data = this.setCredentials(data);
                this.credentials.getURL(function(url) {
                    Realtime.Request.post({
                        url: url,
                        path: "/describeTable",
                        parameters: data,
                        crossDomain: true,
                        headers: headers,
                        complete: function(response) {
                            complete(response, retry, success, function(err) {
                                if (err.retry) {
                                    self.credentials.refreshURL(function() {
                                        self.describeTable(data, success, error, true);
                                    }, error);
                                } else {
                                    if (error) {
                                        error(err.error.message);
                                    }
                                }
                            });
                        }
                    });
                }, error);
            }
        };
    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});
// ITEM SNAPSHOT
(function(Realtime, undefined) {
    /**
     *   @class Realtime.Storage.ItemSnapshot Class with the definition of an item snapshot. {@code: ItemSnapshot\example.js}
     */
    (function(Storage, undefined) {

        Storage.ItemSnapshot = function(args) {

            var _credentials = args.credentials;
            var _table = args.table;
            var _storageConnection = args.connection;
            var _operationManager = args.operationManager;
            var _value = args.value;
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemSnapshot.ref Creates and return a new ItemRef object.
             *   @return A new item reference.
             */
            this.ref = function() {
                return new Realtime.Storage.ItemRef({
                    properties: _value,
                    table: _table,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Object} Realtime.Storage.ItemSnapshot.val Return the value of this snapshot.
             *   @return The value of this snapshot.
             */
            this.val = function() {
                return _value;
            };
        };

    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});
// ITEM REF
(function(Realtime, undefined) {
    /**
     *   @class Realtime.Storage.ItemRef Class with the definition of an item reference.
     */
    (function(Storage, undefined) {

        Storage.ItemRef = function(args) {

            var self = this;
            var _credentials = args.credentials;
            var _table = args.table;
            var _storageConnection = args.connection;
            var _operationManager = args.operationManager;

            var _key = args.key;

            if (!_key) {
                // vem do itemsnapshot
                _table.meta(function(meta) {
                    _key = {
                        primary: args.properties[meta.key.primary.name],
                        secondary: meta.key.secondary ? args.properties[meta.key.secondary.name] : undefined
                    }
                });
            }

            var _notificationEngine = (function(connection, table) {
                var _controlChannels = {};
                var _conn = connection;
                var _tableName = table;
                var _handlers = {
                    put: function(e) {
                        var message = Realtime.JSON.parse(e.message);
                        propageteEvent({
                            operation: "put",
                            message: message
                        });
                    },
                    update: function(e) {
                        var message = Realtime.JSON.parse(e.message);
                        propageteEvent({
                            operation: "update",
                            message: message
                        });
                    },
                    "delete": function(e) {
                        var message = Realtime.JSON.parse(e.message);
                        propageteEvent({
                            operation: "delete",
                            message: message
                        });
                    }
                };
                var _eventEmitter = {};
                Realtime.Event.extend(_eventEmitter);

                var propageteEvent = function(args) {
                    var evt = {};
                    evt[args.operation] = new Realtime.Storage.ItemSnapshot({
                        table: _table,
                        credentials: _credentials,
                        connection: _storageConnection,
                        value: args.message
                    });
                    _eventEmitter.fire(evt);
                };
                var subscribe = function(type, key, once, callback) {
                    var channelName = "rtcs_" + _tableName + "_" + type;

                    if (key) {
                        channelName += ":" + key.primary;
                        if (typeof key.secondary != "undefined") {
                            channelName += "_" + key.secondary;
                        }
                    }

                    if (!_controlChannels[channelName]) {
                        var handler = _handlers[type];

                        if (_conn.isConnected()) {
                            _conn.subscribe({
                                name: channelName
                            });
                        } else {
                            _conn.createChannel({
                                name: channelName
                            });
                        }

                        _controlChannels[channelName] = true;

                        var evt = {};
                        evt[type] = callback;

                        if (once) {
                            _conn.channels[channelName].once({
                                message: handler
                            });
                            _eventEmitter.once(evt);
                        } else {
                            _conn.channels[channelName].bind({
                                message: handler
                            });
                            _eventEmitter.bind(evt);
                        }
                    } else {
                        var evt = {};
                        evt[type] = callback;

                        if (once) {
                            _eventEmitter.once(evt);
                        } else {
                            _eventEmitter.bind(evt);
                        }
                    }
                };
                var unsubscribe = function(type, key, callback) {
                    if (!type) {
                        _eventEmitter.unbindAll();
                    } else {
                        if (typeof callback != "function") {
                            _eventEmitter.unbindAll(type);
                        } else {
                            var evt = {};
                            evt[type] = callback;
                            _eventEmitter.unbind(evt);
                        }
                    }
                };

                return {
                    subscribe: subscribe,
                    unsubscribe: unsubscribe
                };
            })(_storageConnection, _table.name());

            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemRef.get Get the value of this item reference. {@code: ItemRef\get.js}
             *   @param {optional function(itemSnapshot)} success The function to call once the value is available. The function is called with the item snapshot as argument.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This item reference.
             */
            this.get = function(success, error) {

                _table.meta(function(meta) {

                    var res = {
                        error: null,
                        data: null
                    };

                    if (typeof _key.primary != meta.key.primary.dataType) {
                        res.error = "The primary key specified does not match the table schema.";
                        if (error) {
                            error(res.error);
                        }
                        return self;
                    }

                    if (meta.key.secondary) {
                        if (!_key.secondary) {
                            res.error = "Missing secondary key. Must be specified when creating an ItemRef.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }

                        if (typeof _key.secondary != meta.key.secondary.dataType) {
                            res.error = "The secondary key specified does not match the table schema.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }
                    }

                    _operationManager.getItem({
                        table: _table.name(),
                        key: _key
                    }, function(data) {
                        if (success) {
                            if (Realtime.Util.keys(data) == 0) {
                                success(null);
                            } else {
                                success(new Realtime.Storage.ItemSnapshot({
                                    key: _key,
                                    table: _table,
                                    credentials: _credentials,
                                    connection: _storageConnection,
                                    value: data,
                                    operationManager: _operationManager
                                }));
                            }
                        }

                    }, error);
                });

                return this;
            };
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemRef.set Updates the value of this item reference. {@code: ItemRef\set.js}
             *   @param {Object} items The object with the properties to set or update.
             *   @param {optional function(itemSnapshot)} success The function to call once the item is updated. The function is called with the snapshot of the updated item as argument.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This item reference.
             */
            this.set = function(item, success, error) {

                _table.meta(function(meta) {

                    var res = {
                        error: null,
                        data: null
                    };

                    if (typeof _key.primary != meta.key.primary.dataType) {
                        res.error = "The primary key specified does not match the table schema.";
                        if (error) {
                            error(res.error);
                        }
                        return self;
                    }

                    if (meta.key.secondary) {
                        if (!_key.secondary) {
                            res.error = "Missing secondary key. Must be specified when creating an ItemRef.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }

                        if (typeof _key.secondary != meta.key.secondary.dataType) {
                            res.error = "The secondary key specified does not match the table schema.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }
                    }

                    if (Realtime.Util.keys(item).length == 0) {
                        res.error = "No properties to update";
                        if (error) {
                            error(res.error);
                        }
                        return self;
                    }

                    _operationManager.updateItem({
                        table: _table.name(),
                        key: _key,
                        item: item
                    }, function(data) {
                        if (success) {
                            success(new Realtime.Storage.ItemSnapshot({
                                key: _key,
                                table: _table,
                                credentials: _credentials,
                                connection: _storageConnection,
                                value: data,
                                operationManager: _operationManager
                            }));
                        }
                    }, error);

                });
                return this;
            };
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemRef.del Delete the value of this item reference. {@code: ItemRef\del.js}
             *   @param {optional Array} properties The name of the properties to delete. A String array.
             *   @param {optional function(itemSnapshot)} success The function to call once the item is deleted. The function is called with the snapshot of the deleted item as argument.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This item reference.
             */
            this.del = function() {

                var properties;
                var success;
                var error;

                if (arguments.length == 3) {
                    properties = arguments[0];
                    success = arguments[1];
                    error = arguments[2];
                }

                if (arguments.length == 2) {

                    if (typeof arguments[0] == "function" && typeof arguments[1] == "function") {
                        success = arguments[0];
                        error = arguments[1];
                    } else if (typeof arguments[1] == "function") {
                        properties = arguments[0];
                        success = arguments[1];
                    }
                }

                if (arguments.length == 1) {
                    if (typeof arguments[0] != "function") {
                        properties = arguments[0];
                    } else {
                        success = arguments[0];
                    }
                }

                _table.meta(function(meta) {

                    var res = {
                        error: null,
                        data: null
                    };

                    if (typeof _key.primary != meta.key.primary.dataType) {
                        res.error = "The primary key specified does not match the table schema.";
                        if (error) {
                            error(res.error);
                        }
                        return self;
                    }

                    if (meta.key.secondary) {
                        if (!_key.secondary) {
                            res.error = "Missing secondary key. Must be specified when creating an ItemRef.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }

                        if (typeof _key.secondary != meta.key.secondary.dataType) {
                            res.error = "The secondary key specified does not match the table schema.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }
                    }

                    var parameters = {
                        table: _table.name(),
                        key: _key
                    };

                    if (Realtime.Util.isArray(properties) && properties.length > 0) {
                        for (var i = 0; i < properties.length; i++) {
                            if (typeof properties[i] != "string") {
                                res.error = "Invalid property names. Must be strings";
                                if (error) {
                                    error(res.error);
                                }
                                return self;
                            }
                        };
                        parameters.properties = properties;
                    }

                    _operationManager.deleteItem(parameters, function(data) {
                        if (success) {
                            success(new Realtime.Storage.ItemSnapshot({
                                table: _table,
                                credentials: _credentials,
                                connection: _storageConnection,
                                value: data,
                                operationManager: _operationManager
                            }));
                        }
                    }, error);
                });

                return this;
            };
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemRef.on Attach a listener to run every time the eventType occurs. {@code: ItemRef\on.js}
             *   @param {String} eventType The type of the event to listen. Possible values: put, update, delete.
             *   @param {function(itemSnapshot)} callback The function to run whenever the event occurs. The function is called with the snapshot of affected item as argument. If the event type is "put", it will immediately trigger a "get" to retrieve the initial state and run the callback with the item snapshot as argument.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This item reference.
             */
            this.on = function(eventType, callback, error) {
                if (!eventType) {
                    if (error) {
                        error("Must specify an event type");
                    }
                    return this;
                }

                if (eventType != "put" && eventType != "delete" && eventType != "update") {
                    if (error) {
                        error("Invalid event type. Possible values: put, delete and update");
                    }
                    return this;
                }

                if (typeof callback != "function") {
                    if (error) {
                        error("Must specify the handler to the event");
                    }
                    return this;
                }

                if (_key) {
                    _notificationEngine.subscribe(eventType, _key, false, callback);
                } else {
                    _table.meta(function(meta) {
                        _notificationEngine.subscribe(eventType, _key, false, callback);
                    });
                }

                if (eventType == "put") {
                    this.get(function(snapshot) {
                        callback(snapshot);
                    });
                }
                return this;
            };
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemRef.off Remove an event handler. {@code: ItemRef\off.js}
             *   @param {optional String} eventType The type of the event to remove. Possible values: put, update, delete. If not specified, it will remove all listeners of this reference.
             *   @param {optional Function} callback The function previously attached. If not specified, it will remove all listeners of the specified type or all listeners of this reference.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This item reference.
             */
            this.off = function(eventType, callback, error) {
                if (eventType) {
                    if (eventType != "put" && eventType != "delete" && eventType != "update") {
                        if (error) {
                            error("Invalid event type. Possible values: put, delete and update");
                        }
                        return this;
                    }
                }
                _notificationEngine.unsubscribe(eventType, _key, callback);
                return this;
            };
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.ItemRef.once Attach a listener to run only once the event type occurs. {@code: ItemRef\once.js}
             *   @param {String} eventType The type of the event to listen. Possible values: put, update, delete.
             *   @param {function(itemSnapshot)} callback The function to run when the event occurs. The function is called with the snapshot of affected item as argument.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This item reference.
             */
            this.once = function(eventType, callback, error) {
                if (!eventType) {
                    if (error) {
                        error("Must specify an event type");
                    }
                    return this;
                }

                if (eventType != "put" && eventType != "delete" && eventType != "update") {
                    if (error) {
                        error("Invalid event type. Possible values: put, delete and update");
                    }
                    return this;
                }

                if (typeof callback != "function") {
                    if (error) {
                        error("Must specify the handler to the event");
                    }
                    return this;
                }

                if (eventType == "put") {
                    this.get(function(snapshot) {
                        callback(snapshot);
                    });
                } else {
                    if (_key) {
                        _notificationEngine.subscribe(eventType, _key, true, callback);
                    } else {
                        _table.meta(function(meta) {
                            _notificationEngine.subscribe(eventType, _key, true, callback);
                        });
                    }
                }

                return this;
            };
        };
    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});
// TABLE SNAPSHOT
(function(Realtime, undefined) {
    /**
     *   @class Realtime.Storage.TableSnapshot Class with the definition of a table snapshot. {@code: TableSnapshot\example.js}
     */
    (function(Storage, undefined) {

        Storage.TableSnapshot = function(args) {

            var _credentials = args.credentials;
            var _storageConnection = args.connection;
            var _operationManager = args.operationManager;
            var _name = args.name;
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableSnapshot.ref Creates and return a new TableRef object.
             *   @return A new ItemReference.
             */
            this.ref = function() {
                return new Realtime.Storage.TableRef({
                    name: _name,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Object} Realtime.Storage.TableSnapshot.val Return the name of this table.
             *   @return The value of this snapshot.
             */
            this.val = function() {
                return _name;
            };
        };

    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});
// TABLE REF
(function(Realtime, undefined) {
    (function(Storage, undefined) {

        /**
         *   @class Realtime.Storage.TableRef Class with the definition of a table reference.
         */
        Storage.TableRef = function(args) {

            var self = this;

            Realtime.Event.extend(this);

            var _credentials = args.credentials;

            var _storageConnection = args.connection;

            var _operationManager = args.operationManager;

            var _properties = {
                name: args.name || args.properties.name,
                limit: args.properties ? args.properties.limit : 0,
                searchForward: args.properties ? args.properties.searchForward : true,
                filter: args.properties ? args.properties.filter : []
            };

            var _notificationEngine = (function(connection, table) {
                var _controlChannels = {};
                var _conn = connection;
                var _tableName = table;
                var _handlers = {
                    put: function(e) {
                        var message = Realtime.JSON.parse(e.message);
                        propageteEvent({
                            operation: "put",
                            message: message
                        });
                    },
                    update: function(e) {
                        var message = Realtime.JSON.parse(e.message);
                        propageteEvent({
                            operation: "update",
                            message: message
                        });
                    },
                    "delete": function(e) {
                        var message = Realtime.JSON.parse(e.message);
                        propageteEvent({
                            operation: "delete",
                            message: message
                        });
                    }
                };
                var _eventEmitter = {};
                Realtime.Event.extend(_eventEmitter);

                var propageteEvent = function(args) {
                    self.meta(function(myMeta) {
                        var itemKey = {
                            primary: args.message[myMeta.key.primary.name]
                        };

                        if (myMeta.key.secondary) {
                            itemKey.secondary = args.message[myMeta.key.secondary.name];
                        }

                        var evt = {};
                        evt[args.operation] = new Realtime.Storage.ItemSnapshot({
                            key: itemKey,
                            table: self,
                            credentials: _credentials,
                            connection: _storageConnection,
                            value: args.message
                        });
                        _eventEmitter.fire(evt);
                    });
                };
                var subscribe = function(type, key, once, callback) {
                    var channelName = "rtcs_" + _tableName + "_" + type;

                    if (key) {
                        channelName += ":" + key.primary;
                        if (typeof key.secondary != "undefined") {
                            channelName += "_" + key.secondary;
                        }
                    }

                    if (!_controlChannels[channelName]) {
                        var handler = _handlers[type];

                        if (_conn.isConnected()) {
                            _conn.subscribe({
                                name: channelName
                            });
                        } else {
                            _conn.createChannel({
                                name: channelName
                            });
                        }

                        _controlChannels[channelName] = true;

                        var evt = {};
                        evt[type] = callback;

                        if (once) {
                            _conn.channels[channelName].once({
                                message: handler
                            });
                            _eventEmitter.once(evt);
                        } else {
                            _conn.channels[channelName].bind({
                                message: handler
                            });
                            _eventEmitter.bind(evt);
                        }
                    } else {
                        var evt = {};
                        evt[type] = callback;

                        if (once) {
                            _eventEmitter.once(evt);
                        } else {
                            _eventEmitter.bind(evt);
                        }
                    }
                };
                var unsubscribe = function(type, key, callback) {
                    if (!type) {
                        _eventEmitter.unbindAll();
                    } else {
                        if (typeof callback != "function") {
                            _eventEmitter.unbindAll(type);
                        } else {
                            var evt = {};
                            evt[type] = callback;
                            _eventEmitter.unbind(evt);
                        }
                    }
                };

                return {
                    subscribe: subscribe,
                    unsubscribe: unsubscribe
                };
            })(_storageConnection, _properties.name);

            var cloneProperties = function() {
                var clone = {};
                for (var prop in _properties) {
                    if (Realtime.Util.isArray(_properties[prop])) {
                        clone[prop] = _properties[prop].concat();
                    } else {
                        clone[prop] = _properties[prop];
                    }
                };
                return clone;
            };
            /**
             *   @function {public String} Realtime.Storage.TableRef.name Return the name of the refered table. {@code: TableRef\name.js}
             *   @return The name of the refered table.
             */
            this.name = function() {
                return _properties.name;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.limit Applies a limit to this reference confining the number of items. {@code: TableRef\limit.js}
             *   @param {Number} value The limit to apply.
             *   @return This table reference.
             */
            this.limit = function(value, error) {
                if (typeof value != "number") {
                    if (error) {
                        error("The limit must be a number.")
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.limit = value >= 0 ? value : clone.limit;
                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.asc Define if the items will be retrieved in ascendent order. {@code: TableRef\asc.js}
             *   @return This table reference.
             */
            this.asc = function() {
                var clone = cloneProperties();
                clone.searchForward = true;
                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.desc Define if the items will be retrieved in descendent order. {@code: TableRef\desc.js}
             *   @return This table reference.
             */
            this.desc = function() {
                var clone = cloneProperties();
                clone.searchForward = false;
                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.notNull Applies a filter to the table reference. When fetched, it will return the non null values. {@code: TableRef\notNull.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["notNull"] = function(args, error) {
                if (typeof args.item == "string") {
                    var clone = cloneProperties();

                    clone.filter.push({
                        operator: "notNull",
                        item: args.item
                    });
                    return new Storage.TableRef({
                        properties: clone,
                        credentials: _credentials,
                        connection: _storageConnection,
                        operationManager: _operationManager
                    });
                } else {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.isNull Applies a filter to the table. When fetched, it will return the null values. {@code: TableRef\null.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["isNull"] = function(args, error) {
                if (typeof args.item == "string") {
                    var clone = cloneProperties();

                    clone.filter.push({
                        operator: "null",
                        item: args.item
                    });
                    return new Storage.TableRef({
                        properties: clone,
                        credentials: _credentials,
                        connection: _storageConnection,
                        operationManager: _operationManager
                    });
                } else {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.equals Applies a filter to the table. When fetched, it will return the items that match the filter property value. {@code: TableRef\equals.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["equals"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "equals",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.notEquals Applies a filter to the table. When fetched, it will return the items that does not match the filter property value. {@code: TableRef\notEquals.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["notEquals"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value != "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "notEquals",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.greaterEqual Applies a filter to the table. When fetched, it will return the items greater or equal to filter property value. {@code: TableRef\greaterEqual.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["greaterEqual"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "greaterEqual",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.greaterThan Applies a filter to the table. When fetched, it will return the items greater than the filter property value. {@code: TableRef\greaterThan.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["greaterThan"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "greaterThan",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.lesserEqual Applies a filter to the table. When fetched, it will return the items lesser or equals to the filter property value. {@code: TableRef\lesserEqual.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["lesserEqual"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "lessEqual",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.lesserThan Applies a filter to the table. When fetched, it will return the items lesser than the filter property value. {@code: TableRef\lesserThan.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Object} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["lesserThan"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "lessThan",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.contains Applies a filter to the table. When fetched, it will return the items that contains the filter property value. {@code: TableRef\contains.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {String} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["contains"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "contains",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.notContains Applies a filter to the table. When fetched, it will return the items that does not contains the filter property value. {@code: TableRef\notContains.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {String} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["notContains"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "notContains",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.beginsWith Applies a filter to the table. When fetched, it will return the items that begins with the filter property value. {@code: TableRef\beginsWith.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {String} value The value of the property to filter.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["beginsWith"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (typeof args.value == "undefined") {
                    if (error) {
                        error("Invalid filter. The property value must be defined.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "beginsWith",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.between Applies a filter to the table. When fetched, it will return the items in range of the filter property value. {@code: TableRef\between.js}
             *   @param {Object} args The structure with the filter arguments.
             *   @... {String} item The name of the property to filter.
             *   @... {Array} value The definition of the interval. Array of numbers (ex: [1, 5]).
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This table reference.
             */
            this["between"] = function(args, error) {
                if (typeof args.item != "string") {
                    if (error) {
                        error("Invalid filter. The property item must be defined and be a string.");
                    }
                    return this;
                }

                if (!Realtime.Util.isArray(args.value) || (args.value.length != 2)) {
                    if (error) {
                        error("Invalid filter. The property value must be defined and must be an array (length 2) of numbers.");
                    }
                    return this;
                }

                var clone = cloneProperties();
                clone.filter.push({
                    operator: "between",
                    item: args.item,
                    value: args.value
                });

                return new Storage.TableRef({
                    properties: clone,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.meta Gets the metadata of the table reference. {@code: TableRef\meta.js}
             *   @param {function(success)} success The callback to run once the metadata is retrieved.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This table reference.
             */
            this.meta = function(success, error) {
                if (!_meta) {

                    var onceMeta = function(e) {
                        if (success) {
                            success(_meta);
                        }
                        this.unbind({
                            meta: onceMeta
                        });
                    };

                    var errorCallback = function(e) {
                        if (error) {
                            error(e.message);
                        }
                    };

                    this.bind({
                        meta: onceMeta
                    });

                    this.bind({
                        error: errorCallback
                    });
                } else {
                    if (success) {
                        success(_meta);
                    }
                }

                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.del Delete this table. {@code: TableRef\del.js}
             *   @param {function(success)} success The callback to run once the table is deleted.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return The reference to the deleted table.
             */
            this.del = function(success, error) {
                _operationManager.deleteTable({
                    table: this.name()
                }, function(res) {
                    _meta = null;
                    if (success) {
                        success(res.data);
                    }
                }, error);

                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.push Adds a new item to the table. {@code: TableRef\push.js}
             *   @param {Object} item The item to add.
             *   @param {function(success)} success The callback to run once the insertion is done.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This table reference.
             */
            this.push = function(item, success, error) {

                if (typeof item != "object" || Realtime.Util.keys(item).length == 0) {
                    if (error) {
                        error("Invalid item to push.");
                    }
                    return this;
                } else {

                    var res = {
                        error: null,
                        data: null
                    };

                    var parameters = {
                        table: _properties.name,
                        item: item
                    };

                    this.meta(function(_meta) {

                        if (!item[_meta.key.primary.name]) {
                            res.error = "The item specified does not contain the primary key property.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }

                        if (typeof item[_meta.key.primary.name] != _meta.key.primary.dataType) {
                            res.error = "The data type of the primary key does not match the schema of the table.";
                            if (error) {
                                error(res.error);
                            }
                            return self;
                        }

                        if (_meta.key.secondary) {
                            if (!item[_meta.key.secondary.name]) {
                                res.error = "The item specified does not contain the secondary key property.";
                                if (error) {
                                    error(res.error);
                                }
                                return self;
                            }

                            if (typeof item[_meta.key.secondary.name] != _meta.key.secondary.dataType) {
                                res.error = "The data type of the secondary key does not match the schema of the table.";
                                if (error) {
                                    error(res.error);
                                }
                                return self;
                            }
                        }

                        if (_meta.key.secondary) {
                            if (Realtime.Util.keys(item).length <= 2) {
                                res.error = "Cannot put an item that only contains key properties.";
                                if (error) {
                                    error(res.error);
                                }
                                return self;
                            }
                        } else {
                            if (Realtime.Util.keys(item).length <= 1) {
                                res.error = "Cannot put an item that only contains the key property.";
                                if (error) {
                                    error(res.error);
                                }
                                return self;
                            }
                        }

                    }, error);

                    _operationManager.putItem(parameters, function(data) {
                        if (success) {
                            success(new Realtime.Storage.ItemSnapshot({
                                table: self,
                                credentials: _credentials,
                                connection: _storageConnection,
                                value: data,
                                operationManager: _operationManager
                            }));
                        }

                    }, error);
                }
                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.create Creates a new table. {@code: TableRef\create.js}
             *   @param {Object} args Structure with the table properties.
             *   @... {Object} provisionType The provision type id. Use the Realtime.Storage.ProvisionType object.
             *   @... {optional Object} provisionLoad The provision load id. Use the Realtime.Storage.ProvisionLoad object. Not mandatory when it is a table with custom provision type.
             *   @... {Object} key The definition of the key for this table. Must contain a primary property. The primary property is also an object that must contain a name and datatype. The table can have a secondary key ( { primary: { name: "id", dataType: "string" }, secondary: { name: "timestamp", dataType: "number" } }).
             *   @... {optional Object} throughput The custom provision to apply (ex: throughput: { read: 1, write: 1 }). Required when the provision type is Custom.
             *   @param {function(success)} success The callback to run once the table is created.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This table reference.
             */
            this.create = function(args, success, error) {
                var res = {
                    error: null,
                    data: null
                };

                if (!args.provisionType) {
                    res.error = "Missing provision type property. Must specify the provision type properties. The provision values must be between 1 and 5. Use the constants in the Storage.ProvisionType object";
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                if (typeof args.provisionType != "number") {
                    res.error = "Invalid provision. Must specify the provision type properties. The provision values must be between 1 and 5. Use the constants in the Storage.ProvisionType object";
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                if (!args.key) {
                    res.error = "Missig argument key. The key schema must be specified";
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                if (typeof args.key.primary != "object") {
                    res.error = "Missing primary key. The primary key property must be an object.";
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                if (typeof args.key.primary.name == "undefined" || typeof args.key.primary.dataType == "undefined") {
                    res.error = "The primary key must contain a name and a data type (dataType) properties.";
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                if (args.key.primary.dataType != "string" && args.key.primary.dataType != "number") {
                    res.error = 'Invalid primary key dataType. Must be "number" or "string".';
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                var parameters = {
                    table: _properties.name,
                    provisionType: args.provisionType,
                    key: {
                        primary: args.key.primary
                    }
                };

                if (args.key.secondary) {

                    if (typeof args.key.secondary != "object") {
                        res.error = "The secondary key property must be an object.";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (typeof args.key.secondary.name == "undefined" || typeof args.key.secondary.dataType == "undefined") {
                        res.error = "The secondary key must contain a name and a data type (dataType) properties.";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (args.key.secondary.dataType != "string" && args.key.secondary.dataType != "number") {
                        res.error = 'Invalid secondary key dataType. Must be "number" or "string".';
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    parameters.key.secondary = args.key.secondary;
                }

                // custom
                if (parameters.provisionType == 5) {
                    // read and write throughput
                    if (typeof args.throughput != "object") {
                        res.error = "Invalid throughput. For custom provision you must specify the throughput object with the read and write values. The values mean operations per second (ex: 2 reads per second and 3 writes per second).";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (typeof args.throughput.read != "number") {
                        res.error = "Invalid read throughput. Must be a number";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (typeof args.throughput.write != "number") {
                        res.error = "Invalid write throughput. Must be a number";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    parameters.throughput = args.throughput;

                } else {

                    if (!args.provisionLoad) {
                        res.error = "Must specify the provision load property. The provision values must be between 1 and 3. Use the constants in the Storage.ProvisionLoads object";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (typeof args.provisionLoad != "number") {
                        res.error = "Invalid provision. Must specify the provision properties. The provision load value must be between 1 and 3. Use the constants in the Storage.ProvisionLoads object";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    parameters.provisionLoad = args.provisionLoad;
                }

                _operationManager.createTable(parameters, success, error);

                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.update Updates the provision type of the referenced table. {@code: TableRef\update.js}
             *   @param {Object} args Structure with the table properties.
             *   @... {optional Object} provisionType The new provision type id. Use the Realtime.Storage.ProvisionTypes object.
             *   @... {optional Object} provisionLoad The new provision load id. Use the Realtime.Storage.ProvisionLoads object.
             *   @... {optional Object} throughput The custom provision to apply (ex: throughput: { read: 1, write: 1 }). Required when the provision type is Custom.
             *   @param {function(success)} success The callback to run once the table is updated.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This table reference.
             */
            this.update = function(args, success, error) {

                var res = {
                    error: null,
                    data: null
                };

                var parameters = {
                    table: _properties.name
                };

                if (!args.provisionType && !args.provisionLoad) {
                    res.error = "Nothing to update. Must specify a provision load or a provision type. Use the constants in the Storage.ProvisionType and Storage.ProvisionLoad objects";
                    if (error) {
                        error(res.error);
                    }
                    return this;
                }

                if (args.provisionType) {
                    if (typeof args.provisionType != "number") {
                        res.error = "Invalid provisionType property. The provision values must be between 1 and 5. Use the constants in the Storage.ProvisionType object";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }


                    parameters.provisionType = args.provisionType;
                }

                if (args.provisionLoad) {
                    if (typeof args.provisionLoad != "number") {
                        res.error = "Invalid provisionLoad property. The provision values must be between 1 and 3. Use the constants in the Storage.ProvisionLoad object";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    parameters.provisionLoad = args.provisionLoad
                }

                if (args.provisionType == 5) {
                    if (typeof args.throughput != "object") {
                        res.error = "Invalid throughput. For custom provision you must specify the throughput object with the read and write values. The values mean operations per second (ex: 2 reads per second and 3 writes per second).";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (typeof args.throughput.read != "number") {
                        res.error = "Invalid read throughput. Must be a number";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    if (typeof args.throughput.write != "number") {
                        res.error = "Invalid write throughput. Must be a number";
                        if (error) {
                            error(res.error);
                        }
                        return this;
                    }

                    parameters.throughput = args.throughput;

                }

                _operationManager.updateTable(parameters, function(data) {
                    _meta = null;
                    if (success) {
                        success(data)
                    }
                }, error);

                return this;
            };
            /**
             *   @function {public Realtime.Storage.ItemRef} Realtime.Storage.TableRef.item Creates a new item reference. {@code: TableRef\item.js}
             *   @param {Object} key Structure with the key properties.
             *   @... {Object} primary The primary key. Must match the table schema.
             *   @... {Object} secondary The secondary key. Must match the table schema.
             *   @return The new item reference
             */
            this.item = function(key, error) {
                if (typeof key != "object") {
                    if (error) {
                        error("Invalid key argument. Must be an object.");
                    }
                    return this;
                }
                if (!key.primary) {
                    if (error) {
                        error("Invalid key object. Primary key missing");
                    }
                    return this;
                }
                return new Realtime.Storage.ItemRef({
                    key: key,
                    table: this,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.getItems Get the items of this tableRef. {@code: TableRef\getItems.js}
             *   @param {function(itemSnapshot)} success The function to call once the items are available. The success function will be called for each existent item. The argument is an item snapshot. In the end, when all calls are done, the success function will be called with null as argument to signal that there are no more items.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This table reference.
             */
            var getItems = function(success, error) {

                self.meta(function(meta) {
                    var operation;

                    var res = {
                        error: null,
                        data: null
                    };

                    var parameters = {
                        table: _properties.name
                    };

                    if (meta.key.secondary && _properties.filter.length == 1) {
                        var filter = _properties.filter[0];

                        if (filter.item == meta.key.primary.name && filter.operator == "equals") {
                            parameters.key = {
                                primary: filter.value
                            };
                            operation = "queryItems";
                        } else {
                            operation = "listItems";
                            parameters.filter = _properties.filter.concat();
                        }

                    } else if (meta.key.secondary && _properties.filter.length == 2) {

                        var props = {};

                        for (var i = 0; i < _properties.filter.length; i++) {
                            var filter = _properties.filter[i];

                            if (filter.item == meta.key.primary.name && filter.operator == "equals") {
                                props.key = filter.value;
                            }

                            if (filter.item == meta.key.secondary.name) {
                                props.filter = filter;
                            }
                        }

                        if (props.key && props.filter) {
                            operation = "queryItems";
                            parameters.key = {
                                primary: props.key
                            };
                            parameters.filter = props.filter;
                        } else {
                            operation = "listItems";
                            parameters.filter = _properties.filter.concat();
                        }

                    } else {
                        operation = "listItems";

                        if (_properties.filter.length > 0) {
                            parameters.filter = _properties.filter.concat();
                        }
                    }

                    if (operation == "queryItems") {

                        if (_properties.limit > 0) {
                            parameters.limit = _properties.limit;
                        }

                        parameters.searchForward = _properties.searchForward;

                    }

                    var isCompleted = false;

                    var cb = function(response) {

                        var resultArr = response.items;

                        if (_properties.limit > response.items.length && response.stopKey) {
                            parameters.startKey = response.stopKey;
                            _operationManager[operation](parameters, cb, error);
                        } else {
                            isCompleted = true;
                        }

                        if (operation != "queryItems") {

                            var KeyToOrder = meta.key.secondary ? "secondary" : "primary";

                            if (meta.key[KeyToOrder].dataType == "number") {
                                if (_properties.searchForward) {
                                    resultArr.sort(function(a, b) {
                                        return a[meta.key[KeyToOrder].name] - b[meta.key[KeyToOrder].name];
                                    });
                                } else {
                                    resultArr.sort(function(a, b) {
                                        return -1 * (a[meta.key[KeyToOrder].name] - b[meta.key[KeyToOrder].name]);
                                    });
                                }
                            } else {
                                if (_properties.searchForward) {
                                    resultArr.sort(function(a, b) {
                                        return a[meta.key[KeyToOrder].name].localeCompare(b[meta.key[KeyToOrder].name]);
                                    });
                                } else {
                                    resultArr.sort(function(a, b) {
                                        return -1 * (a[meta.key[KeyToOrder].name].localeCompare(b[meta.key[KeyToOrder].name]));
                                    });
                                }
                            }

                            if (_properties.limit > 0 && _properties.limit < resultArr.length) {
                                resultArr = resultArr.slice(0, _properties.limit);
                            }
                        }

                        for (var i = 0; i < resultArr.length; i++) {

                            (function(item) {

                                var _key = {
                                    primary: item[meta.key.primary.name]
                                };

                                if (meta.key.secondary) {
                                    _key.secondary = item[meta.key.secondary.name]
                                }
                                if (success) {
                                    success(new Realtime.Storage.ItemSnapshot({
                                        key: _key,
                                        table: self,
                                        credentials: _credentials,
                                        connection: _storageConnection,
                                        value: item,
                                        operationManager: _operationManager
                                    }));
                                }
                            })(resultArr[i]);
                        };

                        if (isCompleted) {
                            if (success) {
                                success(null);
                            }
                        }
                    };

                    _operationManager[operation](parameters, cb, error);

                }, error);
            };

            this.getItems = function(success, error) {
                getItems(success, error);
                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.on Attach a listener to run every time the eventType occurs. {@code: TableRef\on.js}
             *   @param {String} eventType The type of the event to listen. Possible values: put, update, delete.
             *   @param {optional String} primaryKey The primary key of the items to listen. The callback will run every time an item with the primary key.
             *   @param {function(itemSnapshot)} callback The function to run whenever the event occurs. The function is called with the snapshot of affected item as argument. If the event type is "put", it will immediately trigger a "getItems" to get the initial data and run the callback with each item snapshot as argument.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This item reference.
             */
            this.on = function() {

                var eventType;
                var primaryKey;
                var success;
                var error;

                if (arguments.length == 4) {

                    eventType = arguments[0];
                    primaryKey = arguments[1];
                    success = arguments[2];
                    error = arguments[3];

                } else if (arguments.length == 3) {

                    eventType = arguments[0];

                    if (typeof arguments[1] == "function") {
                        success = arguments[1];
                        error = arguments[2];
                    } else {
                        primaryKey = arguments[1];
                        success = arguments[2];
                    }

                } else if (arguments.length == 2) {
                    eventType = arguments[0];
                    if (typeof arguments[1] == "function") {
                        success = arguments[1];
                    } else {
                        primaryKey = arguments[1];
                    }
                } else {
                    if (typeof error == "function") {
                        error("Invalid arguments. You must specify an event type and a success callback. The primary key is optional.");
                    }
                    return this;
                }

                if (eventType != "put" && eventType != "delete" && eventType != "update") {
                    if (typeof error == "function") {
                        error("Invalid event type. Possible values: put, delete and update");
                    }
                    return this;
                }

                if (primaryKey && typeof primaryKey != "string") {
                    if (typeof error == "function") {
                        error("Invalid primary key. It must be a string.");
                    }
                    return this;
                }

                if (typeof success != "function") {
                    if (typeof error == "function") {
                        error("Must specify a success function.");
                    }
                    return this;
                }

                if (primaryKey) {
                    _notificationEngine.subscribe(eventType, {
                        primary: primaryKey
                    }, false, success);

                    if (eventType == "put") {
                        this.meta(function(meta) {
                            if (meta.key.secondary) {
                                var clone = cloneProperties();
                                var ref = new Storage.TableRef({
                                    properties: clone,
                                    credentials: _credentials,
                                    connection: _storageConnection,
                                    operationManager: _operationManager
                                }).equals({
                                    item: meta.key.primary.name,
                                    value: primaryKey
                                });

                                ref.getItems(
                                    function(snapshot) {
                                        success(snapshot);
                                    },
                                    function(e) {
                                        if (typeof error == "function") {
                                            error(e);
                                        }
                                        return self;
                                    }
                                );
                            } else {
                                self.item({
                                    primary: primaryKey
                                }).get(function(snapshot) {
                                        success(snapshot);
                                    },
                                    function(e) {
                                        if (typeof error == "function") {
                                            error(e);
                                        }
                                        return self;
                                    }
                                );
                            }
                        });
                    }
                } else {
                    this.meta(function(meta) {

                        if (eventType == "put") {
                            self.getItems(
                                function(snapshot) {
                                    success(snapshot);
                                },
                                function(e) {
                                    if (typeof error == "function") {
                                        error(e);
                                    }
                                    return self;
                                }
                            );
                        }

                        var haveFilter = false;

                        for (var i = 0; i < _properties.filter.length && !haveFilter; i++) {
                            if (_properties.filter[i].item == meta.key.primary.name && _properties.filter[i].operator == "equals") {
                                _notificationEngine.subscribe(eventType, {
                                    primary: _properties.filter[i].value
                                }, false, success);
                                haveFilter = true;
                            }
                        };

                        if (!haveFilter) {
                            _notificationEngine.subscribe(eventType, undefined, false, success);
                        }

                    });
                }

                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.off Remove an event handler. {@code: TableRef\off.js}
             *   @param {optional String} eventType The type of the event to remove. Possible values: put, update, delete. If not specified, it will remove all listeners of this reference.
             *   @param {optional String} primaryKey The primary key of the items to stop listen.
             *   @param {optional Function} callback The function previously attached. If not specified, it will remove all listeners of the specified type or all listeners of this reference.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This item reference.
             */
            this.off = function() {

                var eventType;
                var primaryKey;
                var success;
                var error;

                if (arguments.length == 4) {
                    eventType = arguments[0];
                    primaryKey = arguments[1];
                    success = arguments[2];
                    error = arguments[3];
                } else if (arguments.length == 3) {
                    eventType = arguments[0];

                    if (typeof arguments[1] == "function") {
                        success = arguments[1];
                        error = arguments[2];
                    } else {
                        primaryKey = arguments[1];
                        success = arguments[2];
                    }

                } else if (arguments.length == 2) {
                    eventType = arguments[0];
                    success = arguments[1];
                } else if (arguments.length == 1) {
                    eventType = arguments[0];
                }

                if (eventType) {
                    if (eventType != "put" && eventType != "delete" && eventType != "update") {
                        if (typeof error == "function") {
                            error("Invalid event type. Possible values: put, delete and update");
                        }
                        return this;
                    } else {
                        if (primaryKey) {
                            _notificationEngine.unsubscribe(eventType, {
                                primary: primaryKey
                            }, success);
                        } else {
                            this.meta(function(meta) {
                                var haveFilter = false;

                                for (var i = 0; i < _properties.filter.length && !haveFilter; i++) {
                                    if (_properties.filter[i].item == meta.key.primary.name && _properties.filter[i].operator == "equals") {
                                        _notificationEngine.unsubscribe(eventType, {
                                            primary: _properties.filter[i].value
                                        }, success);
                                        haveFilter = true;
                                    }
                                };

                                if (!haveFilter) {
                                    _notificationEngine.unsubscribe(eventType, undefined, success);
                                }
                            });

                        }
                    }
                } else {
                    _notificationEngine.unsubscribe(undefined, undefined, undefined);
                }

                return this;
            };
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.TableRef.once Attach a listener to run only once the event type occurs. {@code: TableRef\once.js}
             *   @param {String} eventType The type of the event to listen. Possible values: put, update, delete.
             *   @param {optional String} primaryKey The primary key of the items to listen. The callback will run every time an item with the primary key.
             *   @param {function(itemSnapshot)} callback The function to run when the event occurs. The function is called with the snapshot of affected item as argument.
             *   @param {optional function(error)} error The function to run whenever an error occurs.
             *   @return This item reference.
             */
            this.once = function() {
                var eventType;
                var primaryKey;
                var success;
                var error;

                if (arguments.length == 4) {

                    eventType = arguments[0];
                    primaryKey = arguments[1];
                    success = arguments[2];
                    error = arguments[3];

                } else if (arguments.length == 3) {

                    eventType = arguments[0];

                    if (typeof arguments[1] == "function") {
                        success = arguments[1];
                        error = arguments[2];
                    } else {
                        primaryKey = arguments[1];
                        success = arguments[2];
                    }

                } else if (arguments.length == 2) {
                    eventType = arguments[0];
                    if (typeof arguments[1] == "function") {
                        success = arguments[1];
                    } else {
                        primaryKey = arguments[1];
                    }
                } else {
                    if (typeof error == "function") {
                        error("Invalid arguments. You must specify an event type and a success callback. The primary key is optional.");
                    }
                    return this;
                }

                if (eventType != "put" && eventType != "delete" && eventType != "update") {
                    if (typeof error == "function") {
                        error("Invalid event type. Possible values: put, delete and update");
                    }
                    return this;
                }

                if (primaryKey && typeof primaryKey != "string") {
                    if (typeof error == "function") {
                        error("Invalid primary key. It must be a string.");
                    }
                    return this;
                }

                if (typeof success != "function") {
                    if (typeof error == "function") {
                        error("Must specify a success function.");
                    }
                    return this;
                }

                if (primaryKey) {
                    _notificationEngine.subscribe(eventType, {
                        primary: primaryKey
                    }, true, success);

                    if (eventType == "put") {
                        this.meta(function(meta) {
                            if (meta.key.secondary) {

                                var clone = cloneProperties();
                                var ref = new Storage.TableRef({
                                    properties: clone,
                                    credentials: _credentials,
                                    connection: _storageConnection,
                                    operationManager: _operationManager
                                }).equals({
                                    item: meta.key.primary.name,
                                    value: primaryKey
                                });

                                ref.getItems(
                                    function(snapshot) {
                                        success(snapshot);
                                    },
                                    function(e) {
                                        if (typeof error == "function") {
                                            error(e);
                                        }
                                        return self;
                                    }
                                );
                            } else {
                                self.item({
                                    primary: primaryKey
                                }).get(function(snapshot) {
                                        success(snapshot);
                                    },
                                    function(e) {
                                        if (typeof error == "function") {
                                            error(e);
                                        }
                                        return self;
                                    }
                                );
                            }
                        });
                    }
                } else {
                    _notificationEngine.subscribe(eventType, undefined, true, success);

                    if (eventType == "put") {
                        this.getItems(
                            function(snapshot) {
                                success(snapshot);
                            },
                            function(e) {
                                if (typeof error == "function") {
                                    error(e);
                                }
                                return self;
                            }
                        );
                    }
                }

                return this;
            };

            var _meta;

            _operationManager.describeTable({
                table: this.name()
            }, function(data) {
                _meta = data;
                self.fire({
                    meta: _meta
                });
            }, function(error) {
                self.fire({
                    error: {
                        message: error
                    }
                });
            });
        };

    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});
// CREDENTIALS
(function(Realtime, undefined) {
    /**
     *   @class Realtime.Storage.Credentials Class with the definition of the Storage credentials.
     */
    (function(Storage, undefined) {

        Storage.Credentials = function(args) {
            /**
             *   @property {public String} Realtime.Storage.Credentials.applicationKey Public key of the application's license.
             */
            this.applicationKey = args.applicationKey;
            /**
             *   @property {public String} Realtime.Storage.Credentials.authenticationToken Authentication token associated to this Credentials object.
             */
            this.authenticationToken = args.authenticationToken;
            /**
             *   @property {public Boolean} Realtime.Storage.Credentials.isSecure Defines if the requests and nofitications are under a secure connection.
             */
            this.isSecure = typeof args.isSecure == "boolean" ? args.isSecure : false;
            /**
             *   @property {public Boolean} Realtime.Storage.Credentials.isCluster Defines if the specified url is from a cluster server.
             */
            this.isCluster = typeof args.isCluster == "boolean" ? args.isCluster : true;
            /**
             *   @property {public String} Realtime.Storage.Credentials.url The url of the storage server.{@default http://storage-balancer.realtime.co/server/1.0}
             */
            var serverUrl;
            if (args.url) {
                if (this.isCluster) {
                    this.url = args.url;
                } else {
                    this.url = serverUrl = args.url;
                }
            } else {
                if (this.isSecure) {
                    this.url = "https://storage-balancer.realtime.co/server/ssl/1.0";
                } else {
                    this.url = "http://storage-balancer.realtime.co/server/1.0";
                }
            }
            /*
             *   @function {public void} Realtime.Storage.Credentials.getURL Retrieves the url of the Storage server.
             *   @param {function(url)} callback Function to run once the url is available.
             */
            this.getURL = function(callback, error) {
                if (!serverUrl) {
                    Realtime.Request.get({
                        url: this.url,
                        crossDomain: true,
                        complete: function(response) {
                            if (response.url) {
                                serverUrl = response.url;
                                callback(serverUrl);
                            } else {
                                if (error) {
                                    if (response.error.message) {
                                        error("Could not retrieve the server url from the cluster. " + response.error.message);
                                    } else {
                                        error("Could not retrieve the server url from the cluster." + response.error);
                                    }
                                }

                            }
                        }
                    });
                } else {
                    callback(serverUrl);
                }
            };
            /*
             *   @function {public void} Realtime.Storage.Credentials.refreshURL Refreshes the url of the server.
             *   @param {function(url)} callback Function to run once the url refreshed.
             */
            this.refreshURL = function(callback, error) {
                serverUrl = null;
                if (args.url && !this.isCluster) {
                    callback(args.url);
                } else {
                    this.getURL(callback, error);
                }
            };
        };

    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});
// STORAGE REF
(function(Realtime, undefined) {
    /**
     *   @class Realtime Provides access to the Realtime Framework.
     */

    /**
     * @class Realtime.Storage Provides access to the Realtime Storage API.
     */

    (function(Storage, undefined) {

        /**
         *   @class Realtime.Storage.StorageRef Class with the definition of a storage reference.
         */
        Storage.StorageRef = function(args) {

            var self = this;

            var _credentials = this.credentials = new Realtime.Storage.Credentials(args);
            var _operationManager = new Realtime.Storage.Operation(_credentials);

            var _onReconnect = args.onReconnect;
            var _onReconnecting = args.onReconnecting;

            var connectionSettings = {
                url: _credentials.isSecure ? "https://ortc-storage.realtime.co/server/ssl/2.1/" : "http://ortc-storage.realtime.co/server/2.1/",
                appKey: _credentials.applicationKey,
                authToken: _credentials.authenticationToken,
                connectAttempts: 100,
                onReconnect: typeof _onReconnect == "function" ? function() {
                    _onReconnect.call(self, self);
                } : undefined,
                onReconnecting: typeof _onReconnecting == "function" ? function() {
                    _onReconnecting.call(self, self);
                } : undefined
            };

            var _storageConnection = this.connection = Realtime.Messaging.ConnectionManager.create(connectionSettings);
            /**
             *   @function {public Realtime.Storage.TableRef} Realtime.Storage.StorageRef.table Creates a new item reference. {@code: StorageRef\table.js}
             *   @param {String} name The table name.
             *   @return The new item reference
             */
            this.table = function(tableName) {
                if (!tableName) {
                    return null;
                }
                return new Realtime.Storage.TableRef({
                    name: tableName,
                    credentials: _credentials,
                    connection: _storageConnection,
                    operationManager: _operationManager
                });
            };
            /**
             *   @function {public Realtime.Storage.StorageRef} Realtime.Storage.StorageRef.isAuthenticated Verifies if the specified token is authenticated. {@code: StorageRef\isAuthenticated.js}
             *   @param {String} authenticationToken The token to verify.
             *   @param {function(args)} callback Function called when the operation is completed and the response is available.
             *   @return This storage reference.
             */
            this.isAuthenticated = function(authenticationToken, success, error) {
                if (typeof authenticationToken != "string") {
                    if (error) {
                        error("No token to verify.");
                    }
                    return this;
                }

                _operationManager.isAuthenticated({
                    authenticationToken: authenticationToken
                }, success, error);

                return this;
            };
            /**
             *   @function {public Realtime.Storage.StorageRef} Realtime.Storage.StorageRef.getTables List the existent tables for this application license. {@code: StorageRef\getTables.js}
             *   @param {function(itemSnapshot)} success The function to call once the values are available. The function will be called with a table snapshot as argument, as many times as the number of tables existent.
             *   @param {optional function(error)} error The function to run if an exception occurred. The function is called with the error description.
             *   @return This storage reference.
             */
            this.getTables = function(success, error) {
                _operationManager.listTables({}, function(res) {
                    if (success) {
                        for (var i = 0; i < res.tables.length; i++) {
                            success(new Realtime.Storage.TableSnapshot({
                                name: res.tables[i],
                                credentials: _credentials,
                                connection: _storageConnection,
                                operationManager: _operationManager
                            }));
                        };
                    }
                }, error);
                return this;
            };
        };
        /**
         *   @function {public Realtime.Storage.StorageRef} Realtime.Storage.create Creates a new Storage reference. {@code: StorageRef\create.js}
         *   @param {Object} args Structure with the necessary arguments to create a storage reference.
         *   @... {String} applicationKey Public key of the application's license.
         *   @... {String} authenticationToken A token authenticated.
         *   @... {optional Boolean} isSecure Defines if the requests are performed via HTTPS. Defaults to false.
         *   @... {optional Boolean} isCluster Defines if the specified url is from a cluster server. Defaults to true.
         *   @... {optional String} url The url of the storage server. Defaults to "storage.realtime.co".
         *   @... {optional Function} onReconnect Function to run everytime the notification system recovers from a disconnect.
         *   @... {optional Function} onReconnecting Function to run everytime the notification system tries to recconect.
         *   @param {optional function(storageReference)} success The callback to run if the creation of the StorageRef succeeded.
         *   @param {optional function(error)} error The callback to run if an error occurred creating the StorageRef.
         */
        var getInternetExplorerVersion = function() {
            // Returns the version of Internet Explorer or a -1
            // (indicating the use of another browser).
            var version = null; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent;
                var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    version = parseFloat(RegExp.$1);
            }
            return version;
        };

        Storage.create = function(args, success, error) {
            if (!args.applicationKey) {
                if (error) {
                    error("Cannot create a storage reference without specifying a valid application key.");
                }
            }

            if (!args.authenticationToken) {
                if (error) {
                    error("Cannot create a storage reference without specifying an authenticated token.");
                }
            }

            var ieVersion = getInternetExplorerVersion();
            if (ieVersion && ieVersion < 10) {

                var pageProtocol = window.location.protocol;
                var message = "Cannot create a StorageRef with the specified arguments. ";
                message += "In order to do cross-domain requests, the requesting page must be using the same protocol (http or https) as the server. "
                message += "You are trying to do requests from " + pageProtocol + " protocol to " + (args.isSecure ? "https: protocol." : "http: protocol.");

                if (pageProtocol == "file:") {
                    if (error) {
                        error(message);
                    }
                    return;
                }

                if (args.url) {
                    if (!args.url.match(pageProtocol)) {
                        if (error) {
                            message = "The specified url does not match the page protocol. " + message;
                            error(message);
                        }
                        return;
                    }
                } else {
                    if (pageProtocol != (args.isSecure ? "https:" : "http:")) {
                        if (error) {
                            error(message);
                        }
                        return;
                    }
                }

            }

            var instance = new Realtime.Storage.StorageRef(args);

            instance.credentials.getURL(function() {
                if (success) {
                    success(instance);
                }
            }, function(e) {
                error(e)
            });
        };

        /**
         * @class Realtime.Storage.ProvisionType Provides access to the available provision types.
         */
        Storage.ProvisionType = {
            /**
             *   @property {Number} Realtime.Storage.ProvisionType.Light Id of the Light provision type (26 operations per second).
             */
            Light: 1,
            /**
             *   @property {Number} Realtime.Storage.ProvisionType.Medium Id of the Medium  provision type (50 operations per second).
             */
            Medium: 2,
            /**
             *   @property {Number} Realtime.Storage.ProvisionType.Intermediate  Id of the Intermediate provision type (100 operations per second).
             */
            Intermediate: 3,
            /**
             *   @property {Number} Realtime.Storage.ProvisionType.Heavy Id of the Heavy provision type (200 operations per second).
             */
            Heavy: 4,
            /**
             *   @property {Number} Realtime.Storage.ProvisionType.Custom Id of the Custom provision type (customized read and write throughput).
             */
            Custom: 5
        };
        /**
         * @class Realtime.Storage.ProvisionLoad Provides access to the available provision load definitions.
         */
        Storage.ProvisionLoad = {
            /**
             *   @property {Number} Realtime.Storage.ProvisionLoad.Read Id of the Read provision load (Assign more read capacity than write capacity).
             */
            Read: 1,
            /**
             *   @property {Number} Realtime.Storage.ProvisionLoad.Write Id of the Write provision load (Assign more write capacity than read capacity).
             */
            Write: 2,
            /**
             *   @property {Number} Realtime.Storage.ProvisionLoad.Balanced Id of the Balanced provision load (Assign similar read an write capacity).
             */
            Balanced: 3
        };
    })(window.Realtime.Storage = window.Realtime.Storage || {});
})(window.Realtime = window.Realtime || {});