var Winston = require('winston'); // For logging
var SMS = require('./models/sms.js');
var db = require('./db.js');
var UDP = require('./udp_server.js');

// Setup logging to file and console
var logger = new (Winston.Logger)({
    transports: [
        new (Winston.transports.Console)({
            colorize: true,
            level: 'debug'
        }),
        new (Winston.transports.File)({
            level: 'info',
            timestamp: true,
            filename: 'cratedump.log',
            json: false
        })
    ]
});

// Connect to MySQL on start
db.connect(db.MODE_PRODUCTION, function(err) {
    if (err) {
        logger.error('Unable to connect to MySQL.');
        process.exit(1);
    } else {
        logger.info('MySQL connection made');
        logger.info('App has started');
    }
});

UDP();