var el = document.getElementById('results');

// Context contains bus and headers
var message1Handler = function(message, context) {
    el.value = el.value + "Message 1: " + JSON.stringify(message) + "\n\n";
    console.log("Message 1: " + message);

    context.reply({
        message: {
            Data: "Response Message"
        },
        routingKey: "ResponseMessage"
    });
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.requestresponse.responder";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using "rabbitmq-plugins enable rabbitmq_stomp"

    config.handlers = {
        "Message1": [message1Handler]
    };
});
