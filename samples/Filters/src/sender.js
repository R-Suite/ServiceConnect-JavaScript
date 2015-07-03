var el = document.getElementById('results');

var sendMessages = function() {

    el.value = el.value + "Sending Message 1" + "\n\n";

    bus.send({
        routingKey: "Message1",
        message: {
            data: "Message 1: Send"
        }
    });

    el.value = el.value + "Sending Message 2" + "\n\n";

    bus.send({
        routingKey: "Message2",
        message: {
            data: "Message 2: Send"
        }
    });

    el.value = el.value + "Sending Message 3" + "\n\n";

    bus.send({
        routingKey: "Message3",
        message: {
            data: "Message 3: Send"
        }
    });
};

var filter = function(envelope) {
    var body = envelope.message.data;
    envelope.message.data = envelope.message.data + " (Modified by sender)";

    el.value = el.value + "Inside filter - " + JSON.stringify(envelope.message) + "\n\n";

    return body === "Message 2: Send";
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.filters.sender";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.outgoingFilters = [filter];

    config.queueMappings = { // Destination to send messages to.  
        "Message1": ["rmessagebus.stomp.filters.consumer"],
        "Message2": ["rmessagebus.stomp.filters.consumer"],
        "Message3": ["rmessagebus.stomp.filters.consumer"]
    };

    config.onConnect = sendMessages;
});
