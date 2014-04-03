var fs = require('fs'),
    readline = require('readline'),
    async = require('async');
    pool = require('../commons/mysql');
    tools = require('../commons/mysql-tools');

var insertDeckWordSequence = function(deckid, word, sequence, callback){
    tools.generateInserter(
        pool,
        'INSERT INTO deckwordsequences SET ?',
        {
            deckid: deckid,
            word: word,
            sequence: sequence
        }
    )(callback);
};

module.exports = function(deckName, deckId, path, callback){

    var rd = readline.createInterface({
        input: fs.createReadStream(path),
        output: process.stdout,
        terminal: false
    });

    var list = [];
    rd.on('line', function(line) {
        var word = line.trim();
        word!='' ? list.push(word) : null;
    });
    rd.on('close', function() {
        console.info('=================== length: ' + list.length);
        var asyncInserts = new Array(list.length);
        list.forEach(function(word, i){
            var insert = function(cb){
                insertDeckWordSequence(deckId, word, i+1, function(err, rows){
                    cb(err, rows.affectedRows);
                });
            };
            asyncInserts[i] = insert;
        });

        async.series(asyncInserts,
            function(err, results){
                if(err){
                    console.error('Fail to insert words into deck ' + deckName + ': ' + err.message);
                }
                else{
                    console.info(results.length + ' words are inserted into deck ' + deckName);
                }
                if(callback){
                    callback(err, results);
                }
            }
        );
    });
};