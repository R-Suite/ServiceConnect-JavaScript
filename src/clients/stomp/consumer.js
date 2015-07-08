(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define(["SockJS", "Stomp"], factory);
    } else {
        factory(window.SockJS, window.Stomp);
    }
}(function(SockJS, Stomp) {

    "use strict";

    var consumer = function(options, callback) {

        var configuration = options;

        var ws = new SockJS(options.url);
        var client = Stomp.over(ws);
        client.debug = null;

        var onConnectError = function() {
            console.error("Connection failed.");
        };

        client.connect(
            options.username,
            options.password,
            callback,
            onConnectError,
            options.vhost
        );

        client.heartbeat.outgoing = 0;
        client.heartbeat.incoming = 0;

        var processMessageCallback;

        var processMessage = function(m) {
            var message = JSON.parse(m.body);
            var headers = m.headers;
            headers.TimeReceived = Date.now();
            headers.DestinationMachine = "Browser";
            headers.DestinationAddress = configuration.queue;

            var result = processMessageCallback({
                message: message,
                headers: headers,
                routingKey: headers.FullTypeName
            });

            headers.TimeProcessed = Date.now();

            if (result.success) {
                if (configuration.auditingEnabled) {
                    client.send('/amq/queue/' + configuration.auditQueue, headers, JSON.stringify(message));
                }
            } else if (!configuration.disableErrors) {
                if (result.exception) {
                    var exceptionString = result.exception.constructor === Object || result.exception === Array ? JSON.stringify(result.exception) : result.exception;

                    headers.Exception = JSON.stringify({
                        TimeStamp: Date.now(),
                        ExceptionType: "JavaScript",
                        Message: exceptionString,
                        StackTrace: "",
                        Source: "",
                        Exception: exceptionString
                    });
                }
                client.send('/amq/queue/' + configuration.errorQueue, headers, JSON.stringify(message));
            }
        };

        var startConsuming = function(messageEvent) {
            processMessageCallback = messageEvent;
            client.subscribe('/queue/' + configuration.queue, processMessage);
        };

        var consumeMessageType = function(routingKey) {
            if (routingKey.constructor === Object) {
                client.subscribe('/' + (routingKey.type || "topic") + '/' + routingKey.routingKey, processMessage);
            } else {
                client.subscribe('/topic/' + routingKey, processMessage);
            }
        };

        var destroy = function() {
            client.disconnect(function() {
                console.log("Disconnected");
            });
        };

        return {
            startConsuming: startConsuming,
            consumeMessageType: consumeMessageType,
            destroy: destroy
        };
    };

    window.Consumer = consumer;
    return consumer;
}));
