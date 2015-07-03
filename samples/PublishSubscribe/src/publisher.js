var el = document.getElementById('results');

var publishMessages = function () {
    el.value = el.value + "Publishing Message 1" + "\n\n";

    bus.publish({
        routingKey: "Message1",
        message: {
            data: "Message 1: Send"
        }
    });

    el.value = el.value + "Publishing Message 2" + "\n\n";

    bus.publish({
        routingKey: "Message2",
        message: {
            data: "Message 2: Send"
        }
    });
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.publishsubscribe.publisher";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.onConnect = publishMessages;
});
