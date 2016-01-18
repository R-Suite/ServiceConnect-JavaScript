var el = document.getElementById('results');

var publishMessages = function() {
    el.value = el.value + "Publishing Message 1" + "\n\n";

    bus.publish({
        routingKey: "Message1",
        message: {
            data: "Message 1: Send"
        }
    });

    el.value = el.value + "Publishing Message 2" + "\n\n";

    bus.publish({
        routingKey: "PublishSubscribe.Messages.PublishSubscribeMessage",
        message: {},
        type: "exchange",
        exchange: "PublishSubscribeMessagesPublishSubscribeMessage"
    });
};

var bus = Bus.initialize(function(config) {
    config.queue = "serviceconnect.stomp.publishsubscribe.publisher";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.onConnect = publishMessages;
});
