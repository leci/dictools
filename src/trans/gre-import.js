var importWord = require('./import');

var deckName = 'GRE';
var deckId = 1;
var path = __dirname + '/../../data/final/gre.txt'; //6490

importWord(deckName, deckId, path);