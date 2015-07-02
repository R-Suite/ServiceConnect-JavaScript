
// Context contains bus and headers
var message1Handler = function(message, context) {
    document.getElementById('results').value = document.getElementById('results').value + 
                                               "\n\n" + 
                                               "Message 1: " + 
                                               JSON.stringify(message);
    console.log("Message 1: " + message);
};

var message2Handler = function (message, context) {
    document.getElementById('results').value = document.getElementById('results').value + 
                                           "\n\n" + 
                                           "Message 2: " + 
                                           JSON.stringify(message);
    console.log("Message 2: " + message);
};

var message3Handler = function (message, context) {
    document.getElementById('results').value = document.getElementById('results').value + 
                                           "\n\n" + 
                                           "Message 3: " + 
                                           JSON.stringify(message);
    console.log("Message 3: " + message);
};

var beforeFilter = function(envelope){
    var body = envelope.body.data;
    envelope.body.data = envelope.body.data + " (Modified by consumer)";

    document.getElementById('results').value = document.getElementById('results').value + 
                                   "\n\n" + 
                                   "Inside beforeFilter - " + JSON.stringify(envelope.body);
    
    return body === "Message 3 (Modified by sender)";
};

var afterFilter = function(envelope){   
    document.getElementById('results').value = document.getElementById('results').value + 
                                           "\n\n" + 
                                           "Inside afterFilter - " + JSON.stringify(envelope.body);
};

var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.filters.consumer";
    config.url = "http://lonappdev04:15674/stomp"; // Enable stomp adapter using "rabbitmq-plugins enable rabbitmq_stomp"
    config.beforeConsumingFilters = [beforeFilter];
    config.afterConsumingFilters = [afterFilter];
    config.handlers = {
        "Message1": message1Handler,
        "Message2": message2Handler,
        "Message3": message3Handler
    };
});
