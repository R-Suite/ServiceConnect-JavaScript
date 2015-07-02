
var sendMessages = function () {

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending Message 1" + "\n\n";

    bus.send("Message1", {
        data: "Message 1"
    });

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending Message 2" + "\n\n";

    bus.send("Message2", {
        data: "Message 2"
    });

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending Message 3" + "\n\n";

    bus.send("Message3", {
        data: "Message 3"
    });
};

var filter = function(envelope){
    var body = envelope.body.data;
    envelope.body.data = envelope.body.data + " (Modified by sender)";

    document.getElementById('results').value = document.getElementById('results').value + 
                                       "Inside filter - " + JSON.stringify(envelope.body) + "\n\n";

    return body === "Message 2";
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.filters.sender";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.outgoingFilters = [filter]

    config.queueMappings = {  // Destination to send messages to.  
        "Message1": "rmessagebus.stomp.filters.consumer",
        "Message2": "rmessagebus.stomp.filters.consumer",
        "Message3": "rmessagebus.stomp.filters.consumer"
    };

    config.onConnect = sendMessages;
});
