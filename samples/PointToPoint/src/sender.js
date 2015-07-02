
var sendMessages = function () {

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending Message 1" + "\n\n";

    bus.send("Message1", {
        data: "Message 1: Send"
    });

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending Message 2" + "\n\n";

    bus.send("rmessagebus.stomp.pointtopoint.consumer", "Message2", {
        data: "Message 2: Send"
    });
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.pointtopoint.sender";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
  
    config.queueMappings = {  // Destination to send messages to.  
        "Message1": "rmessagebus.stomp.pointtopoint.consumer",
    };

    config.onConnect = sendMessages;
});
