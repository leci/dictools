var cheerio = require("cheerio");
var transfer = function(html) {
    if(!html) {return null;}
    var vocabularies = [];
    var $ = cheerio.load(html);
    var count = 0;
    var ascii = /^[ -~]+$/;
    var vcbre = /^[A-Za-z'-]+$/;
    $("p.calibre_353 span:first-child").each(function(i, e) {
        var line = $(e).text();
        var asciiRe = new RegExp(ascii);
        var vcbRe = new RegExp(vcbre);
        count++;
        if ( !asciiRe.test( line ) || !vcbRe.test( line ) ) {
            console.error(count + '\t\t' + line);
        }
        vocabularies.push(line);
    });
    console.log('count: ' + count);
    return vocabularies;
};

var run = function(handle, htmlPath, textPath){
    var fs = require('fs');
    fs.readFile(htmlPath, function(err, data){
        if(err){
            console.error(err);
            throw err;
        }
        var vocabularies = handle(data);
        if(!textPath){return;}
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

var htmlPath = './data/tuofu.htm';
var textPath = './data/tuofu.txt';
run(transfer, htmlPath, textPath);