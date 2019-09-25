/**
 * PARENT class for the stage classes
 * @param {Number} [index] the index of the stage being created
 */

class Stages {
    static stage_count = 0;
    constructor(_index) {
        this.index = _index || Stages.stage_count;
        Stages.stage_count++
    }
}

module.exports = Stages;