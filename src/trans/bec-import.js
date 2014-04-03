var importWord = require('./import');

var deckName = 'BEC';
var deckId = 13;
var path = __dirname + '/../../data/final/bec.txt'; //6490

importWord(deckName, deckId, path);