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
        endpoints: ["rmessagebus.stomp.pointtopoint.consumer"],
        routingKey: "Message2",
        message: {
            data: "Message 2: Send"
        }
    });
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.pointtopoint.sender";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp

    config.queueMappings = { // Destination to send messages to.  
        "Message1": ["rmessagebus.stomp.pointtopoint.consumer", ]
    };

    config.onConnect = sendMessages;
});
