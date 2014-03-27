var redisClient = require('../commons/redis');
var logger = require('../commons/logging').logger;
//var mysqlConn = require("../commons/mysql");
var pool = require("../commons/mysql");
var config = require('../../settings').job;
var http = require("http");
var grep = require("./grep");
var Counter = require('./counter');
var batchSize = config.batchSize;
var baseUrl = config.baseUrl;
var savePage = config.savePage;
var WORD = config.WORD;

var download = function (url, callback) {
    http.get(url, function (res) {
        var data = "";
        res.on('data', function (chunk) {data += chunk;});
        res.on("end", function () {callback(data);});
    })
    .on("error", function (err) {
        if(err){logger.error(err);}
        callback(null);
    });
};
var makeUrl = function(word){return baseUrl + word.replace(/ /g, '+');};

var catalogKey = 'dict:ctlg';
var vcbKey = 'dict:vcb:';
var batchQueueKey = 'dict:bq';
var externalUrlQueueKey = 'dict:urls';

/*
 * a set which hold the words is not crawled successfully
 * (including not-existed, network err, or parse error)
 */
var lostSetKey = 'dict:ls';

//var cb = function(err, result){
//    if(err){logger.error(err); throw err;}
//    logger.debug( result + ' item is processed');
//};

var insertUrl = function(record){
    pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO t_external_urls SET ?', record, function(err, result) {
            if(err){
                logger.error('Fail to insert url ['+record.url+']: ' + err.message);
            }
            connection.release();
        });
    });
};
var insertUrls = function(urls){
    for (var i=0; i<urls.length; i++) {
        insertUrl({url: urls[i]});
    }
};
var pushUrls = function(urls){
    var multi = redisClient.multi();
    for (var i=0; i<urls.length; i++) {
        multi.rpush(externalUrlQueueKey, urls[i]);
    }
    multi.exec(function(err, results) {
        if(err){
            logger.error('Fail to push urls: ' + err.message);
        }
        else{
            logger.info('Succeed to push '+urls.length+' urls');
        }
    })
};

var insertWordPage = function(record){
    pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO t_word_pages SET ?', record, function(err, result) {
            if(err){
                logger.error('Fail to insert word ['+record.word+']: ' + err.message);
            }
            connection.release();
        });
    });
};


var work = function(){
    var queueLength = 0;
    var counter = new Counter().start();
    redisClient.lpop(batchQueueKey, function(err, item){
        if(err){logger.error(err); throw err;}
        if(item===null){
            logger.warn('now more item in the list');
            return;
        }
        logger.warn('the worker '+process.pid+' begin to crawl words from ' + item);

        var start = Number(item)-1;
        var end = start + batchSize - 1;
        logger.info('range: ' + start + '-' + end);
        redisClient.lrange(catalogKey, start, end, function(err, items){
            queueLength += items.length;
            items.forEach(function(item, index){
                download(makeUrl(item), function(data){
                    if(!data){
                        logger.warn((start + index) + '\t\t' + item + ' is NOT downloaded');
                        redisClient.sadd(lostSetKey, item);
                    }
                    else{
                        logger.info((start + index) + '\t\t' + item + ' is downloaded');
                        var word = null;
                        try{
                            word = grep(data);
                        }catch(e){
                            logger.error('Fail to grep vocabulary [' + item + ']: ' + e.message);
                            redisClient.sadd(lostSetKey, item);
                        }
                        if(savePage){
                            insertWordPage({word: item, page: word[WORD.PAGE]});
                        }

                        if(word[WORD.URLS].length>0){
//                            pushUrls(word[WORD.URLS]);
                            insertUrls(word[WORD.URLS]);
                        }
                        word[WORD.URLS] = null;
                        word[WORD.SENTENCES] = JSON.stringify(word[WORD.SENTENCES]);
                        word[WORD.PAGE] = null;
                        redisClient.hmset(vcbKey+item, word);
                    }

                    queueLength--;
                    if(queueLength<=0){
                        counter.end();
                        work();
                    }
                });
            });
        });
    }); // pop
};
work();
