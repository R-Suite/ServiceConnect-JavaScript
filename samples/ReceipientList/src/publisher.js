
var sendMessages = function () {

    var recipientList = [
        "rmessagebus.stomp.recipientlist.consumer1",
        "rmessagebus.stomp.recipientlist.consumer2"
    ];

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending using recipient list pattern" + "\n\n";    

    bus.send(recipientList, "Message1", {
        data: "Message 1: Send"
    });

    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Sending using recipient list response pattern" + "\n\n";    

    bus.sendRequest(recipientList, "Message2", {
        data: "Message 2: Send"
    }, responseHandler);
};

var responseHandler = function(message){
    document.getElementById('results').value = document.getElementById('results').value + 
                                           "Received response: " + JSON.stringify(message) + "\n\n";
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.recipientlist.publisher";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using rabbitmq-plugins enable rabbitmq_stomp
    config.onConnect = sendMessages;
});
