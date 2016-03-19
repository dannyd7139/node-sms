var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var logger = require('winston');

server.on('error', function(err) {
    logger.error('UDP Server Error : ' + err);
    server.close();
});

server.on('message', function(msg, rinfo) {
    var arr = msg.toString().split(";");
    logger.info('Message recieved from ' + rinfo.address + ':' + rinfo.port + ' : ');
    console.log(toObject(arr));
});

server.on('listening', function() {
    var address = server.address();
    logger.info('UDP Server listening on ' + address.address + ':' + address.port);
});


module.exports = function () {
    server.bind(44444);
}

function toObject(arr) {
    var object = {};
    for (var i=0; i<arr.length; i++) {
        var temp = arr[i].toString().split(":");
        object[temp[0]] = temp[1];
    }
    return object;
}
