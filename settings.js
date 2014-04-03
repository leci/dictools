module.exports = {
    id: 'li',
    name: 'liao',
    creator: 'henryleu',
    secretKey: 'quick',
    port: 3020,
    redis:{
        host: 'localhost',
        port: 6379
    },
    mysql:{
        host: 'localhost',
        user: 'leci',
        password: 'leci',
        database:'word_dict',
        port: 3306
    },
    logging: {
        reloadSecs: 0, //INFO: set 0 could let nodeunit tests which use log4js exit properly
        level: 'DEBUG'
    },
    job: {
        baseUrl:'http://cn.bing.com/dict/search?q=',
        batchSize: 100,
        sentenceLimit: 5,
        savePage: true,
        mainDir: 'd:/tmp/dict/',
        dictFilename: 'dict.json',
        urlFilename: 'urls.txt',
        WORD: {
            EN_US: 'pn_us',
            EN_UK: 'pn_uk',
            SENTENCES: 'stcs',
            URLS: 'urls',
            PAGE: 'pg',
            ID: 'wd'
        },
        SENTENCE: {
            TEXT_EN: 'en',
            TEXT_CN: 'cn',
            FROM: 'fm',
            RADIO: 'rd',
            VIDEO: 'vd',
            ID: 'id'
        }
    },
    resources: {
        appName: '极聊',
        appTitle: '有“极聊”，不寂寥',
        appCreator: '番茄实验室',
        errorUnknown: '不好意思，系统出了点小问题'
    }
};
