var redisClient = require('../commons/redis');
var mysqlConn = require("../commons/mysql");
var logger = require('../commons/logging').logger;
mysqlConn.connect(function(err){
    if(err){logger.error(err);}
    logger.info('mysql connection is ok');
});

var catalogKey = 'dict:ctlg';
var sizeKey = 'dict:sz';
var vcbKey = 'dict:vcb:';

//set the size of vocabularies in catalog
mysqlConn.query('SELECT count(word) AS size from t_words', function(err, rows, fields) {
    if(err){logger.error(err); throw err;}

    var size = rows[0].size;
    redisClient.set(sizeKey, size, function(err){
        if(err){logger.error(err); throw err;}
        logger.info('The size of the vocabularies in dict is: ', size);
    });
});

//delete catalog
redisClient.del(catalogKey, function(err){
    if(err){logger.error(err); throw err;}
    logger.info('list is empty');
});

//init catalog
mysqlConn.query('SELECT word from t_words order by word', function(err, rows, fields) {
    if(err){logger.error(err); throw err;}
    var word = '';
    rows.forEach(function(item, index) {
        word = item.word;
        var cb = function(err, result){
            if(err){logger.error(err); throw err;}
        };
        redisClient.rpush(catalogKey, word, cb);
        redisClient.del(vcbKey+word);
    });
    redisClient.quit();
});
mysqlConn.end();