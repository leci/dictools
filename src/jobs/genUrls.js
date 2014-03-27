var redisClient = require('../commons/redis');
var config = require('../../settings').job;
var logger = require('../commons/logging').logger;
var Counter = require('./counter');
var externalUrlQueueKey = 'dict:urls';

var gen = function(){
    var counter = new Counter().start();
    var path = config.mainDir + config.urlFilename;
    var stream = require('./file')(path);
    var encoding = 'UTF8';
    redisClient.lrange(externalUrlQueueKey, 0, -1, function(err, items){
        if(err){
            logger.error('Fail to get the bill of all external urls: '+err.message);
            throw err;
        }
        items.forEach(function(item){
            stream.safeWrite(item+'\r\n', encoding);
        });
        stream.end('');
        logger.info('Succeed to get the bill of all external urls.');
        counter.end();
        redisClient.quit();
    });
};
gen();

