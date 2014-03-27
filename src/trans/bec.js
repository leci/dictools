var cheerio = require("cheerio");
var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
var transfer = function(html) {
    if(!html) {return null;}
    var vocabularies = [];
    var $ = cheerio.load(html);
    var count = 0;
    var useless = '词根、词缀预习表';
    var ascii = /^[ -~]+$/;
    var vcbre = /^[ A-Za-z'-]+$/;
    $("p.calibre_207 > span:first-child").each(function(i, e) {
        var line = $(e).text();
        var asciiRe = new RegExp(ascii);
        var vcbRe = new RegExp(vcbre);
        if(line!=useless){
            count++;

            //process the word which can be processed
            var i = line.indexOf('［');

            //process the word which can not be processed
            line = line.slice(0, i);
            if ( i==-1 || !asciiRe.test( line ) || !vcbRe.test( line ) ) {
                console.error(count + '\t\t' + line);
            }
            vocabularies.push(line);
        }
    });
    console.log('count: ' + count);
    return vocabularies;
};

var run = function(htmlPath, textPath){
    var fs = require('fs');
    fs.readFile(htmlPath, function(err, data){
        if(err){
            console.error(err);
        }
        var vocabularies = transfer(data);
        var text = vocabularies.join('\r\n');
        fs.writeFile(textPath, text, {encoding: 'UTF8', flag: 'w'}, function (err) {
            if (err) {
                console.error(err);
                throw err;
            }
            console.info(vocabularies.length + ' vocabularies are written to ' + textPath);
        });
    });
}

var htmlPath = './data/bec.htm';
var textPath = './data/bec.txt';
run(htmlPath, textPath);