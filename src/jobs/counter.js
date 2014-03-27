var logger = require('../commons/logging').logger;
var Counter = function(){this.st = new Date().getTime();};
Counter.prototype = {
    st: 0, //startTime (milliseconds)
    et: 0, //endTime (milliseconds)
    tk: 0, //took (seconds spent)
    start: function(){this.st = new Date().getTime(); return this;},
    end: function(){
        this.et = new Date().getTime();
        this.tk = (this.et-this.st)/1000;
        logger.info('it took ' + this.tk + ' seconds to run the job');
        return this;
    }
};

module.exports = Counter;