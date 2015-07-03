var el = document.getElementById('results');

// Context contains bus and headers
var message1Handler = function(message, context) {
    el.value = el.value + "Message 1: " + JSON.stringify(message) + "\n\n";
    console.log("Message 1: " + message);
};

var message2Handler = function(message, context) {
    el.value = el.value + "Message 2: " + JSON.stringify(message) + "\n\n";
    console.log("Message 2: " + message);
};

var message3Handler = function(message, context) {
    el.value = el.value + "Message 3: " + JSON.stringify(message) + "\n\n";
    console.log("Message 3: " + message);
};

var beforeFilter = function(envelope) {
    var body = envelope.message.data;
    envelope.message.data = envelope.message.data + " (Modified by consumer)";
    el.value = el.value + "Inside beforeFilter - " + JSON.stringify(envelope.message) + "\n\n";

    return body === "Message 3: Send (Modified by sender)";
};

var afterFilter = function(envelope) {
    el.value = el.value + "Inside afterFilter - " + JSON.stringify(envelope.message) + "\n\n";
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.filters.consumer";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using "rabbitmq-plugins enable rabbitmq_stomp"
    config.beforeConsumingFilters = [beforeFilter];
    config.afterConsumingFilters = [afterFilter];
    config.handlers = {
        "Message1": [message1Handler],
        "Message2": [message2Handler],
        "Message3": [message3Handler]
    };
});
