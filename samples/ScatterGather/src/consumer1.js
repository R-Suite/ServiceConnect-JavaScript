var el = document.getElementById('results');

// Context contains bus and headers
var message1Handler = function(message, context) {
    el.value = el.value + "Message 1: " + JSON.stringify(message) + "\n\n";

    context.reply({
        message: {
            Data: "Response Message 1"
        },
        routingKey: "ResponseMessage"
    });
};

var message2Handler = function(message, context) {
    el.value = el.value + "Message 2: " + JSON.stringify(message) + "\n\n";

    context.reply({
        message: {
            Data: "Response Message 2"
        },
        routingKey: "ResponseMessage"
    });
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.scattergather.consumer1";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using "rabbitmq-plugins enable rabbitmq_stomp"

    config.messageTypes = ["Message1", "Message2"];

    config.handlers = {
        "Message1": [message1Handler],
        "Message2": [message2Handler],
    };
});
