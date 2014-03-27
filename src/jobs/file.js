var fs = require('fs');
var logger = require('../commons/logging').logger;
var WriteStream = function(path){
    var writeStream = fs.createWriteStream(path, { flags : 'w' });
    writeStream.safeWrite = function(data, encoding, callback) {
        write();
        function write() {
            var ok = true;
            //writeStream.once('drain', write);
            ok = writeStream.write(data, encoding, callback);
//            if(ok){
//                writeStream.removeListener('drain', write);
//            }
        }
    }

    writeStream.on('drain', function () {
        logger.warn('Json file ['+path+'] is drained!');
    });
    writeStream.on('close', function () {
        logger.info('Json file ['+path+'] is generated!');
    });
    return writeStream;
};

module.exports = WriteStream;