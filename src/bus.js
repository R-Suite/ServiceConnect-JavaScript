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
            };
        };

        var init = function(options) {

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

            var consumerConnected = false,
                producerConnected = false,
                requestConfigurations = {},
                configuration = options,
                producer = new Producer(configuration, onProducerConnect),
                consumer = new Consumer(configuration, startConsuming);

            var consumeMessageEvent = function(eventArguments) {
                var result = {
                    success: true
                };

                try {
                    if (processFilters(configuration.beforeConsumingFilters, eventArguments)) {
                        return result;
                    }

                    var context = {
                        bus: this,
                        headers: eventArguments.headers,
                        reply: function(replyArgs) {
                            if (eventArguments.headers.RequestMessageId) {
                                send({
                                    endpoints: [eventArguments.headers.SourceAddress],
                                    routingKey: replyArgs.routingKey,
                                    message: replyArgs.message,
                                    headers: {
                                        ResponseMessageId: eventArguments.headers.RequestMessageId
                                    }
                                });
                            }
                        }
                    };

                    processMessageHandlers(eventArguments.message, eventArguments.routingKey, context);
                    processRequestReplyConfigurations(eventArguments.message, eventArguments.routingKey, context);

                    if (processFilters(configuration.afterConsumingFilters, eventArguments)) {
                        return result;
                    }

                    if (eventArguments.headers.RoutingSlip) {
                        processRoutingSlip(eventArguments.message, eventArguments.routingKey, eventArguments.headers);
                    }

                } catch (e) {
                    if (configuration.exceptionCallback) {
                        configuration.exceptionCallback(e);
                    }
                    result.success = false;
                    result.exception = e;
                }

                return result;
            };

            var processMessageHandlers = function(message, routingKey, context) {
                var handlers = configuration.handlers[routingKey];
                if (handlers) {
                    for (var i = 0; i < handlers.length; i++) {
                        handlers[i](message, context);
                    }
                }
            };

            var processRequestReplyConfigurations = function(message, routingKey, context) {
                if (context.headers.ResponseMessageId) {
                    var request = requestConfigurations[context.headers.ResponseMessageId];
                    request.callback(message);

                    if (request.processedCount >= request.endpointsCount) {
                        delete requestConfigurations[context.headers.ResponseMessageId];
                    }
                }
            };

            var processRoutingSlip = function(message, routingKey, headers) {
                var routingSlip = JSON.parse(headers.RoutingSlip);
                if (routingSlip.length > 0) {
                    route({
                        route: routingSlip,
                        routingKey: routingKey,
                        message: message
                    });
                }
            };

            var send = function(args) {
                processHeaders(args);

                if (processFilters(configuration.outgoingFilters, args)) {
                    return;
                }

                producer.send(args);
            };

            var publish = function(args) {
                processHeaders(args);

                if (processFilters(configuration.outgoingFilters, args)) {
                    return;
                }

                producer.publish(args);
            };

            var sendRequest = function(args) {
                processHeaders(args);

                var messageId = generateGuid();
                var endpointsCount = !args.endpoints ? 0 : args.endpoints.length;

                var responses = [];

                var timeout;
                if (args.timeout) {
                    timeout = setInterval(function() {
                        clearInterval(timeout);
                        args.onResponse(responses);
                    }, args.timeout);
                }

                var request = {
                    messageId: messageId,
                    processedCount: 0,
                    endpointsCount: endpointsCount,
                    callback: function(response) {
                        responses.push(response);
                        request.processedCount++;
                        if (request.processedCount >= endpointsCount) {
                            if (timeout) {
                                clearInterval(timeout);
                            }
                            if (responses.length === 1 && endpointsCount <= 1) {
                                args.onResponse(responses[0]);
                            } else {
                                args.onResponse(responses);
                            }
                        }
                    }
                };

                requestConfigurations[messageId] = request;
                args.headers.RequestMessageId = messageId;

                if (processFilters(configuration.outgoingFilters, args)) {
                    return;
                }

                producer.send(args);
            };

            var publishRequest = function(args) {
                processHeaders(args);

                var messageId = generateGuid();

                var responses = [];

                var timeout;
                if (args.timeout) {
                    timeout = setInterval(function() {
                        clearInterval(timeout);
                        args.onResponse(responses);
                    }, args.timeout);
                }

                var endpointsCount = args.expectedReplies;
                var request = {
                    messageId: messageId,
                    processedCount: 0,
                    endpointsCount: args.expectedReplies,
                    callback: function(response) {
                        responses.push(response);
                        request.processedCount++;
                        if (endpointsCount && request.processedCount >= endpointsCount) {
                            if (timeout) {
                                clearInterval(timeout);
                            }
                            args.onResponse(responses);
                        }
                    }
                };

                requestConfigurations[messageId] = request;
                args.headers.RequestMessageId = messageId;

                if (processFilters(configuration.outgoingFilters, args)) {
                    return;
                }

                producer.publish(args);
            };

            var route = function(args) {
                processHeaders(args);

                args.endpoints = [args.route[0]];
                args.route.splice(0, 1);

                args.headers.RoutingSlip = JSON.stringify(args.route);

                if (processFilters(configuration.outgoingFilters, args)) {
                    return;
                }

                producer.send(args);
            };

            var processFilters = function(filters, args) {
                if (filters) {
                    for (var i = 0; i < filters.length; i++) {
                        var stop = filters[i](args);
                        if (stop) {
                            return true;
                        }
                    }
                }
                return false;
            };

            var generateGuid = function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            var processHeaders = function(args) {
                args.headers = args.headers || {};

                if (!args.message.CorrelationId) {
                    args.message.CorrelationId = generateGuid();
                }
            };

            var destroy = function() {
                producer.destroy();
                consumer.destroy();
                configuration = null;
            };

            return {
                route: route,
                send: send,
                publish: publish,
                sendRequest: sendRequest,
                publishRequest: publishRequest,
                destroy: destroy,
                options: options
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
