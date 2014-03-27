var cheerio = require("cheerio");
var config = require('../../settings').job;
var sentenceLimit = config.sentenceLimit;
var savePage = config.savePage;
var WORD = config.WORD;
var SENTENCE = config.SENTENCE;

var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
var grep = function(html) {
    if(!html) {return null;}
    var word = {};
    var externals = [];
    var sentences = [];
    word[WORD.URLS] = externals;
    word[WORD.SENTENCES] = sentences;

    var $ = cheerio.load(html);

    //save useful HTML fragment for grepping in the future
    if(savePage){
        word[WORD.PAGE] = $("div.lf_area").html();
    }
    //grep vocabulary basic
    $("div.qdef > div.hd_area div.hd_p1_1 div.hd_tf > a").each(function(i, e) {
        var regex = new RegExp(expression);
        var onclick = $(e).attr("onclick");
        var urls = onclick.match(regex);
        var url = urls && urls.length>0 ? urls[0] : null;

        if(url){
            externals.push(url);
            url = url.split('/').pop();
            i==0 ? word[WORD.EN_US] = url : word[WORD.EN_UK] = url;
        }
    });

    //grep vocabulary 's sentence
    $("#sentenceCon > #sentenceSeg > div.se_li").each(function(i, e) {
        if(i>=sentenceLimit){
            return;
        }

        var sentence = {};
        var regex = null;
        var rawText = null;
        var urls = null;
        var url = null;

        var sen_en = $(e).find("div.sen_en");
        var sen_cn = $(e).find("div.sen_cn");
        var sen_from = $(e).find("div.sen_li > a");
        var sen_radio = $(e).find("div.mm_div > div.gl_fl > a");
        var sen_video = $(e).find("div.mm_div > div.hi_div > a");

        var en = '';
        sen_en.children().each(function(i, e){
            en += $(e).text();
        });
        sentence[SENTENCE.TEXT_EN] = en;

        var cn = '';
        sen_cn.children().each(function(i, e){
            cn += $(e).text();
        });
        sentence[SENTENCE.TEXT_CN] = cn;

        sentence[SENTENCE.FROM] = sen_from.text();

        regex = new RegExp(expression);
        rawText = sen_radio.attr("onmousedown");
        urls = rawText ? rawText.match(regex) : null;
        url = urls && urls.length>0 ? urls[0] : null;
        if(url){
            externals.push(url);
            url = url.split('/').pop();
            sentence[SENTENCE.RADIO] = url;
        }

        regex = new RegExp(expression);
        rawText = sen_video.attr("onmousedown");
        urls = rawText ? rawText.match(regex) : null;
        url = urls && urls.length>0 ? urls[0] : null;
        if(url){
            externals.push(url);
            url = url.split('/').pop();
            sentence[SENTENCE.VIDEO] = url;
        }
        sentences.push(sentence);
    });

    word[WORD.SENTENCES] = sentences;
    return word;
};

module.exports = grep;
