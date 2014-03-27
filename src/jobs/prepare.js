var redisClient = require('../commons/redis');
var config = require('../../settings').job;
var logger = require('../commons/logging').logger;
var batchSize = config.batchSize;
var sizeKey = 'dict:sz';
var batchQueueKey = 'dict:bq';
var externalUrlQueueKey = 'dict:urls';
/*
 * a set which hold the words is not crawled successfully
 * (including not-existed, network err, or parse error)
 */
var lostSetKey = 'dict:ls';

var cb = function(err, result){
    if(err){logger.error(err); throw err;}
    logger.info( result + ' item are processed');
};

redisClient.del(batchQueueKey, cb);
redisClient.del(lostSetKey, cb);
redisClient.del(externalUrlQueueKey, cb);
redisClient.get(sizeKey, function(err, size){
    if(err){logger.error(err); throw err;}
    var touchEnd = false;
    var start = 0;
    for(var i = 0; i< 100000; i++){
        start = i*batchSize;
        touchEnd = (start + batchSize) >= size;
        redisClient.rpush(batchQueueKey, start+1, cb);
        if(touchEnd){
            break;
        }
    }
    redisClient.quit();
});
