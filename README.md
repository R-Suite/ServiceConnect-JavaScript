# R.MessageBus JavaScript

[![Join the chat at https://gitter.im/R-Suite/R.MessageBus-JavaScript](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/R-Suite/R.MessageBus-JavaScript?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A simple, easy to use messaging framework for client side JavaScript.  

Uses the STOMP messaging protocol which is supported by RabbitMQ, ActiveMQ, HornetQ etc.

All examples and sample projects have been tested on RabbitMQ.

## Features

* Support for many well-known Enterprise Integration Patterns
    - Point to Point
    - Publish/Subscribe
    - Recipient List
    - Scatter Gather
    - Routing Slip
    - Request/Response
* Auditing
* Exception Handling

## Simple example

In this example we simply send a message from one endpoint and consume the same message on another endpoint.  The sender and receiver can be in different browser sessions.

##### 1. Configure the sender bus instance

Calling ```initialize``` creates an instance of the bus and connects to the queue ```rmessagebus.stomp.pointtopoint.sender``` on the server ```http://localhost:15674/stomp```.  ```queueMappings``` defines were to send messages to and uses the format ```{ routingKey: [endpoint1, endpoint2 ]}```.  The ```onConnect``` callback is called once the bus has connected to the messaging server.

``` javascript
var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.pointtopoint.sender";
    config.url = "http://localhost:15674/stomp";  
    config.queueMappings = {  // Destination to send messages to.  
        "Message1": ["rmessagebus.stomp.pointtopoint.consumer",]
    };
    config.onConnect = sendMessages;
});
```

##### 2. Send your message

To send a message using the send function we pass a routing key and a message.  The bus looks up were to send the message using the queueMappings dictionary.

```javascript
bus.send({
    routingKey: "Message1",
    message: {
        data: "Message 1: Send"
    }
});
```

##### 3. Configure the consumer bus instance

Again, we configure an instance of the bus. This time, however we specify a message handler which says all messages with routing key ```Message1``` should be processed by callback ```message1Handler```.

```javascript
var bus = Bus.initialize(function (config) {
    config.queue = "rmessagebus.stomp.pointtopoint.consumer";
    config.url = "http://localhost:15674/stomp"; // Enable stomp adapter using "rabbitmq-plugins enable rabbitmq_stomp"

    config.handlers = {
        "Message1": [message1Handler]
    };
});
```

##### 4. Receive your message

Finally, we define a handler callback that will receive the message. The Context object contains headers and an instance of the bus.

```javascript
var message1Handler = function(message, context) {
    console.log(message);
};
```
