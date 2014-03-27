var redisClient = require('../commons/redis');
var logger = require('../commons/logging').logger;
var config = require('../../settings').job;
var Counter = require('./counter');
var catalogKey = 'dict:ctlg';
var vcbKey = 'dict:vcb:';
var WORD = config.WORD;
var holdCount = 1000;

var gen = function(){
    var queueLength = 0;
    var counter = new Counter().start();
    var path = config.mainDir + config.dictFilename;
    var stream = require('./file')(path);
    var encoding = 'UTF8';
    redisClient.lrange(catalogKey, 0, -1, function(err, items){
        if(err){
            logger.error('Fail to get the catalog of all vocabularies: '+err.message);
            throw err;
        }
        queueLength += items.length;
        var batchIndex = 0;
        var holdIndex = 0;
        var buf = [];
        var data = '';
        var json = null;
        var jsonCount = 0;
        stream.write('[', encoding);
        items.forEach(function(item, index){
            redisClient.hgetall(vcbKey+item, function(err, obj){
                queueLength--;
                if(obj){
                    jsonCount++;
                    holdIndex++;
                    obj[WORD.ID] = item;
                    obj[WORD.SENTENCES] = JSON.parse(obj[WORD.SENTENCES]);
                    json = JSON.stringify(obj, function(k, v){
                        if(WORD.PAGE===k) {return undefined;}
                        if(WORD.URLS===k) {return undefined;}
                        return v;
                    });
//                    console.log(json);
                    buf.push(json);

                    if(holdIndex>holdCount){
                        data = '';
                        if(batchIndex!=0){
                            data = ',';
                        }
                        data += buf.join(',');
//                        data += '\r\n\r\n';
                        batchIndex++;
                        holdIndex = 0;
                        buf = [];
                        json = '';
                        stream.safeWrite(data, encoding);
                        data = '';
                    }
                }
                if(queueLength<=0){
                    if(holdIndex>0){
                        data = '';
                        if(batchIndex!=0){
                            data = ',';
                        }
                        data += buf.join(',');
//                        data += '\r\n\r\n';
                        batchIndex++;
                        holdIndex = 0;
                        buf = [];
                        json = '';
                        stream.safeWrite(data, encoding);
                        data = '';
                    }
                    stream.end(']');
                    counter.end();
                    logger.info('There are '+jsonCount + ' vocabularies are stored in json file');
                }
            });
        });
        //redisClient.quit();
    });
};
gen();

