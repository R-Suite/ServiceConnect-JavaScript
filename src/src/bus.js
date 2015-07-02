(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define(["Consumer", "Producer"], factory);
    } else {
        factory(window.Consumer, window.Producer);
    }
}(function(Consumer, Producer) {

    "use strict";

    var bus = (function() {

        var buildOptions = function() {
            return {
                queue: "r.messagebus.stomp",
                errorQueue: "errors",
                auditQueue: "audit",
                auditingEnabled: false,
                url: "http://localhost:15674/stomp",
                username: "guest",
                password: "guest",
                vhost: "/",
                messageTypes: [], // Pub/Sub messages to consumer.  Array of message types or array of objects containing messageType and type.
                queueMappings: {}, // Route -> Endpoint mappings
                handlers: {}, // Route -> Message handler mappings
                exceptionCallback: null,
                disableErrors: false,
                beforeConsumingFilters: [],
                afterConsumingFilters: [],
                outgoingFilters: []
            }
        };

        var init = function(options) {

            var consumerConnected = false,
                producerConnected = false;

            var startConsuming = function() {
                consumer.startConsuming(consumeMessageEvent, configuration.queue);
                for (var i = 0; i < configuration.messageTypes.length; i++) {
                    consumer.consumeMessageType(configuration.messageTypes[i]);
                }
                consumerConnected = true;
                if (producerConnected && configuration.onConnect) {
                    configuration.onConnect();
                }
            };

            var onProducerConnect = function() {
                producerConnected = true;
                if (consumerConnected && configuration.onConnect) {
                    configuration.onConnect();
                }
            };

            var configuration = options,
                producer = Producer(configuration, onProducerConnect),
                consumer = Consumer(configuration, startConsuming);

            var consumeMessageEvent = function(message, routingKey, headers) {
                var result = {
                    success: true
                };                

                try {
                    if (configuration.beforeConsumingFilters && configuration.beforeConsumingFilters.length > 0){
                        var envelope = {
                            headers: headers,
                            body: message
                        };
                        if (processFilters(configuration.beforeConsumingFilters, envelope)) {
                            return result;
                        }
                        headers = envelope.headers;
                        message = envelope.body;
                    }            

                    var context = {
                        bus: this,
                        headers: headers
                    };        

                    processMessageHandlers(message, routingKey, context);

                    if (configuration.afterConsumingFilters && configuration.afterConsumingFilters.length > 0){
                        if (processFilters(configuration.afterConsumingFilters, {
                            headers: headers,
                            body: message
                        })) {
                            return result;
                        }
                    } 
                } catch (e) {
                    if (configuration.exceptionCallback) {
                        configuration.exceptionCallback(e);
                    };
                    result.success = false;
                    result.exception = ex;
                }

                return result;
            };

            var processFilters = function(filters, envelope) {
                if (filters) {
                    for (var i = 0; i < filters.length; i++) {
                        var stop = filters[i](envelope);
                        if (stop) {
                            return true;
                        }
                    }
                }
                return false;
            };

            var processMessageHandlers = function(message, routingKey, context) {
                var handler = configuration.handlers[routingKey];
                if (handler) {
                    handler(message, context);
                };
            };

            var generateGuid = function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            var send = function() {
                var routingKey,
                    message,
                    endpoints,
                    headers = {};

                if (arguments.length === 2) {
                    routingKey = arguments[0];
                    message = arguments[1];
                } else if (arguments.length === 3) {
                    if (arguments[0] instanceof Array) {
                        endpoints = arguments[0];
                        routingKey = arguments[1];
                        message = arguments[2];
                    } else if (arguments[1].constructor === Object) {
                        routingKey = arguments[0];
                        message = arguments[1];
                        headers = arguments[2];
                    } else {
                        endpoints = [arguments[0]];
                        routingKey = arguments[1];
                        message = arguments[2];
                    }
                } else if (arguments.length === 4) {
                    if (arguments[0] instanceof Array) {
                        endpoints = arguments[0];
                        routingKey = arguments[1];
                        message = arguments[2];
                        headers = arguments[3];
                    } else {
                        endpoints = [arguments[0]];
                        routingKey = arguments[1];
                        message = arguments[2];
                        headers = arguments[3];
                    }
                }

                if (!message.CorrelationId) {
                    message.CorrelationId = generateGuid();
                };

                if (configuration.outgoingFilters && configuration.outgoingFilters.length > 0) {
                    var envelope = {
                        headers: headers,
                        body: message
                    };
                    if (processFilters(configuration.outgoingFilters, envelope)) {
                        return;
                    }
                    headers = envelope.headers;
                    message = envelope.body;
                }

                if (endpoints) {
                    for (var i = 0; i < endpoints.length; i++) {
                        producer.send(endpoints[i], routingKey, message, headers);
                    }
                } else {
                    producer.send(routingKey, message, headers);
                }
            };

            var publish = function(routingKey, message, headers) {
                headers = headers || {};

                if (!message.CorrelationId) {
                    message.CorrelationId = generateGuid();
                };

                if (configuration.outgoingFilters && configuration.outgoingFilters.length > 0) {
                    var envelope = {
                        headers: headers,
                        body: message
                    };
                    if (processFilters(configuration.outgoingFilters, envelope)) {
                        return;
                    }
                    headers = envelope.headers;
                    message = envelope.body;
                }

                producer.publish(routingKey, message, headers);
            };

            return {
                send: send,
                publish: publish
            };
        };

        return {
            initialize: function(callback) {
                var options = buildOptions();
                callback(options);
                return init(options);
            }
        };
    })();


    window.Bus = bus;
    return bus;
}));
