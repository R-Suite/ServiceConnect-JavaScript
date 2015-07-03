var el = document.getElementById('results');

var sendMessages = function() {

    el.value = el.value + "Expect 2 replies" + "\n\n";

    bus.publishRequest({
        message: {
            data: "Message 1: Publish"
        },
        routingKey: "Message1",
        onResponse: responseHandler,
        expectedReplies: 2
    });

    el.value = el.value + "1 reply after timeout" + "\n\n";

    bus.publishRequest({
        message: {
            data: "Message 2: Publish"
        },
        routingKey: "Message2",
        onResponse: responseHandler,
        timeout: 1000, // ms
        expectedReplies: 2
    });
};

var responseHandler = function(message) {
    el.value = el.value + "Received response: " + JSON.stringify(message) + "\n\n";
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.scattergather.publisher";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.onConnect = sendMessages;
});
