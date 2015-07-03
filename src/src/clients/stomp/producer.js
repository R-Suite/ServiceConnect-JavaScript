(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define(["SockJS", "Stomp"], factory);
    } else {
        factory(window.SockJS, window.Stomp);
    }
}(function(SockJS, Stomp) {

    "use strict";

    var producer = function(options, callback) {

        var configuration = options;

        var ws = new SockJS(options.url);
        var client = Stomp.over(ws);

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

        var getHeaders = function(type, headers, queueName, messageType) {
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
            headers.TimeSent = Date.now;
            headers.SourceMachine = "Browser";
            headers.FullTypeName = type;
            headers.ConsumerType = "RabbitMQ";
            headers.Language = "JavaScript";

            return headers;
        };

        var generateGuid = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        var publish = function(args) {
            var headers = getHeaders(args.routingKey, args.headers, configuration.queue, "Publish");
            if (args.type && args.type === "exchange") {
                client.send('/exchange/' + args.exchange, headers, JSON.stringify(args.message));
            } else {
                client.send('/topic/' + args.routingKey, headers, JSON.stringify(args.message));
            }
        };

        var send = function(args) {
            var endpoints = args.endpoints || configuration.queueMappings[args.routingKey];

            for (var i = 0; i <= endpoints.length; i++) {
                var headers = getHeaders(args.routingKey, args.headers, endpoints[i], "Send");
                client.send('/amq/queue/' + endpoints[i], headers, JSON.stringify(args.message));
            }
        };

        var destroy = function() {
            client.disconnect(function() {
                console.log("Disconnected");
            });
        };

        return {
            publish: publish,
            send: send,
            destroy: destroy
        };
    };

    window.Producer = producer;
    return producer;
}));
