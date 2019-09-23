const Stages = require('./parent-stage');

/** 
* a $project stage for a mongo pipeline
* @param {Number} [index] the index to be included in the pipeline
* @example
* let stage = new ProjectStage(22).paths('_id'); // creates project stage that will project the _id field onto the documents after index 22
* console.log(stage) // {stage}
*/

class ProjectStage extends Stages {
    constructor(_index) {
        super(_index)
        this.stage = { $project: {} };
        this.$project = this.stage.$project;
    }

    /**
     * paths to include in the return documents
     * @param {String|Array} [paths] the paths to include in query
     * @return {Instance}
     */

    paths(paths) {
        if (!paths) return this;
        if (paths) {
            paths.replace(/\s+/g, '').split(',').forEach(p => {
                this.$project[p] = 1;
            });
        };
        return this;
    }

    /**
     * paths to omit for the return documents
     * @param {String|Array} [omit] paths to omit
     * @return {Instance}
     */

    omit(omit) {
        if (omit) {
            omit.replace(/\s+/g, '').split(',').forEach(p => {
                this.$project[p] = 0;
            });
        };
        return this;
    }
}

module.exports = ProjectStage;