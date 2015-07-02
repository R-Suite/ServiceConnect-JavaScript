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

        var onConnectError = function() {
            console.error("Connecting to RabbitMQ failed.");
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
            headers.TimeReceived = Date.Now;
            headers.DestinationMachine = "Browser";
            headers.DestinationAddress = configuration.queue;

            var result = processMessageCallback(message, headers["FullTypeName"], headers);

            headers.TimeProcessed = Date.Now;

            if (result.success) {
                if (configuration.auditingEnabled) {
                    client.send('/amq/queue/' + configuration.auditQueue, headers, JSON.stringify(message));
                }
            } else if (!configuration.disableErrors) {
                // Retries not supported just forward to error queue
                if (result.exception) {
                    var exceptionString = result.exception.constructor === Object || result.exception === Array ? JSON.stringify(result.exception) : result.exception;

                    headers.Exception = JSON.stringify({
                        TimeStamp: Date.Now,
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

        return {
            startConsuming: startConsuming,
            consumeMessageType: consumeMessageType
        };
    };

    window.Consumer = consumer;
    return consumer;
}));
