const Stages = require('./parent-stage');

/**
* a $limit stage for a mongo pipeline
* @param {Number} [index] the index of the limit stage in a pipeline
* @param {Number} [pagenation] how many documents are allowed through stage
* @example
* let stage = new LimitStage(99, 5); // will allow 5 documents through the stage after index 99 in pipeline
* console.log(stage); // {stage}
*/

class LimitStage extends Stages {
    constructor(_index, _pagenation) {
        super(_index)
        this.has_field = false;
        if (_pagenation) {this.has_field = true;}
        this.stage = { $limit: _pagenation }
    }
}

module.exports = LimitStage;