(function (factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define(["SockJS", "Stomp"], factory);
    } else {
        factory(window.SockJS, window.Stomp);
    }
}(function (SockJS, Stomp) {

    "use strict";

    var producer = function (options, callback) {

        var configuration = options;

        var ws = new SockJS(options.url);
        var client = Stomp.over(ws);

        var onConnectError = function () {
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

        var getHeaders = function (type, headers, queueName, messageType) {
            if (!headers) {
                headers = {};
            }

            if (!headers.DestinationAddress) {
                headers.DestinationAddress = queueName;
            }

            if (!headers.MessageId) {
                headers.MessageId = generateGuid();
            }

            if (!headers.MessageType) {
                headers.MessageType = messageType;
            }

            headers.SourceAddress = configuration.queue;
            headers.TimeSent = Date.Now;
            headers.SourceMachine = "Browser";
            headers.FullTypeName = type;
            headers.ConsumerType = "RabbitMQ";
            headers.Language = "JavaScript";

            return headers;
        };

        var generateGuid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        var publish = function (routingKey, message, headers) {
            headers = getHeaders(routingKey, headers, configuration.queue, "Publish");
            client.send('/topic/' + routingKey, headers, JSON.stringify(message));
        };

        var send = function () {
            var endpoint,
                routingKey,
                message,
                headers;

            if (arguments.length === 3) {
                routingKey = arguments[0];
                message = arguments[1];
                headers = arguments[2];
                endpoint = configuration.queueMappings[routingKey];
            } else {
                endpoint = arguments[0];
                routingKey = arguments[1];
                message = arguments[2];
                headers = arguments[3];
            }

            headers = getHeaders(routingKey, headers, endpoint, "Send");

            client.send('/amq/queue/' + endpoint, headers, JSON.stringify(message));
        };

        return {
            publish: publish,
            send: send
        };
    };

    window.Producer = producer;
    return producer;
}));
