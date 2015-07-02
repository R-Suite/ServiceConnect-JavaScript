
var sendMessages = function () {

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending request 1" + "\n\n";

    bus.sendRequest("Message1", {
        data: "Message 1: Send"
    }, function(response){
        document.getElementById('results').value = document.getElementById('results').value + 
                                           "Response received: " + JSON.stringify(response) + "\n\n";
    });
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.requestresponse.requestor";
    config.url = "http://lonappdev04:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
  
    config.queueMappings = {  // Destination to send messages to.  
        "Message1": "rmessagebus.stomp.requestresponse.responder",
    };

    config.onConnect = sendMessages;
});
