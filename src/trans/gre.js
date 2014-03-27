var cheerio = require("cheerio");
var transfer = function(html) {
    if(!html) {return null;}
    var vocabularies = [];
    var $ = cheerio.load(html);
    var count = 0;
    var ascii = /^[ -~]+$/;
    $("p.calibre_420 span:first-child").each(function(i, e) {
        var line = $(e).text();
        var re = new RegExp(ascii);
        count++;
        if ( !re.test( line ) ) {
            console.error(count + '\t\t' + line);
        }
        var vcb = line;
        vocabularies.push(vcb);
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

var htmlPath = './data/gre.htm';
var textPath = './data/gre.txt';
run(htmlPath, textPath);