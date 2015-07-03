var el = document.getElementById('results');

// Context contains bus and headers
var message1Handler = function(message, context) {
    el.value = el.value + "Message1: " + JSON.stringify(message) + "\n\n";
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.competingconsumers.consumer";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using "rabbitmq-plugins enable rabbitmq_stomp"

    config.handlers = {
        "Message1": [message1Handler]
    };
});
