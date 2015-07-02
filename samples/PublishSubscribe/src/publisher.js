
var publishMessages = function () {
    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Publishing Message 1" + "\n\n";

    bus.publish("Message1", {
        data: "Message 1: Send"
    });

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Publishing Message 2" + "\n\n";

    bus.publish("Message2", {
        data: "Message 2: Send"
    });
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.publishsubscribe.publisher";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.onConnect = publishMessages;
});
