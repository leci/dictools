var redisClient = require('../commons/redis');
var logger = require('../commons/logging').logger;
var pool = require("../commons/mysql");
var config = require('../../settings').job;
var grep = require("./grep");
var WORD = config.WORD;

var catalogKey = 'dict:ctlg';
var vcbKey = 'dict:vcb:';
var batchQueueKey = 'dict:bq';
var externalUrlQueueKey = 'dict:urls';
var errorSetKey = 'dict:rr';

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

var extract = function(){
    pool.getConnection(function(err, connection) {
        connection.query('SELECT word, page from t_word_pages order by word', function(err, rows, fields) {
            if(err){
                logger.error('Fail to select all word pages: ' + err.message);
                throw err;
            }
            logger.debug('the number of all words to be processed: ' + rows.length);
            rows.forEach(function(item, index){
                var vcb = item.word;
                var data = item.page;
                if(data){
                    var word = null;
                    try{
                        word = grep(data);
                    }catch(e){
                        logger.error('Fail to grep vocabulary [' + vcb + ']: ' + e.message);
                        redisClient.sadd(errorSetKey, vcb);
                    }

                    if(word[WORD.URLS].length>0){
                        insertUrls(word[WORD.URLS]);
                    }
                    word[WORD.URLS] = null;
                    word[WORD.SENTENCES] = JSON.stringify(word[WORD.SENTENCES]);
                    word[WORD.PAGE] = null;
                    redisClient.hmset(vcbKey+item, word);
                }
                else{
                    logger.error('word ['+ vcb +'] has no page');
                }
            });
            logger.info('all words have been processed');
            connection.release();
        });
    });

};
extract();
