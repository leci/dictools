var pool = require("./mysql");
var logger = require("./logging").logger;

var generateFinder = function(pool, sql, multiple) {
    return function(callback){
        pool.getConnection(function(err, connection) {
            if(err){
                logger.error(err);
                callback(err, null);
                return;
            }

            connection.query(sql, function(err, rows, fields) {
                if(err){
                    logger.error(err);
                    callback(err, null);
                }
                else{
                    if(multiple){
                        callback(null, rows);
                    }
                    else{
                        if(rows && rows.length>0){
                            callback(null, rows[0]);
                        }
                        else{
                            callback(null, null);
                        }
                    }
                }
                connection.release();
            });
        });
    };
};

var generateUpdater = function(pool, sql, params) {
    return function(callback){
        pool.getConnection(function(err, connection) {
            if(err){
                logger.error(err);
                callback(err, null);
                return;
            }

            connection.query(sql, params, function(err, rows, fields) {
                if(err){
                    logger.error(err);
                    callback(err, null);
                }
                else{
                    callback(null, rows.affectedRows);
                }
                connection.release();
            });
        });
    };
};

var generateInserter = function(pool, sql, params) {
    return function(callback){
        pool.getConnection(function(err, connection) {
            if(err){
                logger.error(err);
                callback(err, null);
                return;
            }

            connection.query(sql, params, function(err, rows, fields) {
                if(err){
                    logger.error(err);
                    callback(err, null);
                }
                else{
                    callback(null, rows);
                }
                connection.release();
            });
        });
    };
};

module.exports = {
    generateFinder: generateFinder,
    generateUpdater: generateUpdater,
    generateInserter: generateInserter
};
