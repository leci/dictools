var importWord = require('./import');

var deckName = 'TOEFL';
var deckId = 3;
var path = __dirname + '/../../data/final/tuofu.txt';

importWord(deckName, deckId, path);

