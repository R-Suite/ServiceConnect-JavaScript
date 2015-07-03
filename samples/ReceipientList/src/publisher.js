var el = document.getElementById('results');

var sendMessages = function() {

    var recipientList = [
        "rmessagebus.stomp.recipientlist.consumer1",
        "rmessagebus.stomp.recipientlist.consumer2"
    ];

    el.value = el.value + "Sending using recipient list pattern" + "\n\n";

    bus.send({
        message: {
            data: "Message 1: Send"
        },
        endpoints: recipientList,
        routingKey: "Message1"
    });

    el.value = el.value + "Sending using recipient list response pattern. Expect 2 response messages." + "\n\n";

    bus.sendRequest({
        message: {
            data: "Message 2: Send"
        },
        endpoints: recipientList,
        routingKey: "Message2",
        onResponse: responseHandler
    });

    el.value = el.value + "Sending using recipient list response pattern. Expect 1 response after timeout." + "\n\n";

    bus.sendRequest({
        message: {
            data: "Message 3: Send"
        },
        endpoints: recipientList,
        routingKey: "Message3",
        onResponse: responseHandler,
        timeout: 1000
    });
};

var responseHandler = function(message) {
    el.value = el.value + "Received response: " + JSON.stringify(message) + "\n\n";
};

var bus = Bus.initialize(function(config) {
    config.queue = "rmessagebus.stomp.recipientlist.publisher";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.onConnect = sendMessages;
});
