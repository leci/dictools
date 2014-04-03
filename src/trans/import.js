var fs = require('fs'),
    readline = require('readline'),
    pool = require('../commons/mysql');
    tools = require('../commons/mysql-tools');

var deckid = 1;

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

var rd = readline.createInterface({
    input: fs.createReadStream(__dirname + '/../../data/final/gre.txt'),
    output: process.stdout,
    terminal: false
});

var list = [];
rd.on('line', function(line) {
    var word = line.trim();
    word!='' ? list.push(word) : null;
//    console.info(line);
});
rd.on('close', function() {
    console.error('===================length: ' + list.length);
    list.forEach(function(word, i){
        insertDeckWordSequence(deckid, word, i+1, function(err, rows){
//            console.info(deckid + '\t' + word + '\t' + i+1);
        });
    });
});
