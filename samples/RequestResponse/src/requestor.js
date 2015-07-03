var el = document.getElementById('results');

var sendMessages = function () {

    el.value = el.value + "Expect response" + "\n\n";

    bus.sendRequest({
        routingKey: "Message1",
        message: {
            data: "Message 1: Send"
        },
        onResponse: function(response){
            el.value = el.value + "Response received: " + JSON.stringify(response) + "\n\n";
        }
    });    
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.requestresponse.requestor";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
  
    config.queueMappings = {  // Destination to send messages to.  
        "Message1": ["rmessagebus.stomp.requestresponse.responder",]
    };

    config.onConnect = sendMessages;
});
