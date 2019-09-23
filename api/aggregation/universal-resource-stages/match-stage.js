const Stages = require('./parent-stage');

/**
 * create a match stage to insert into a mongodb pipeline with a desired index 
 * @param {Object} [query] for the mongo documents
 * @param {Number} [index] index of the stage for the pipeline
 * @example
 * let match = new MatchStage(33).tags('some,tags,for,you');
 * console.log(match); // {MatchStage }
 * @api public
 */

class MatchStage extends Stages {
    constructor(_index) {
        super(_index);
        this.stage = { $match: {} };
        this.$match = this.stage.$match;
    }

    /** add a custom match query
     *  @param {Object} [custom] the query to add
    */
    custom(query) {
        if (!query) return this;
        this.$match = query;
        return this;
    }

    /**  add a text index query to the match stage
     *   @param {String} [text] the text to be added into the query
     *   @return {Instance}
    */
    text(text) {
        if (!text) return this;
        if (this.index && this.index !== 0)
            console.warn(`!!!WARNING!!! Text stage needs to be 0, USER SET: ${this.index} RESET TO: 0`);
        this.index = 0;
        this.$match.$text = { $search: text };
        return this;
    }

    /** add a tags query to the match stage
     *  @param {Number|Array} [tags] query will match all tags
     *  @return {Instance}
    */
    tags(tags) {
        if (!tags) return this;
        if (tags instanceof Array) {
            tags.forEach(i => {
                if ((typeof i !== 'string')) {
                    throw new Error(`Tags array may only contain strings got: ${typeof i}`)
                }
            })
            this.$match.tags = { $all: tags }
        } else
            this.$match.tags = { $all: tags.replace(/\s+/g, '').split(',') }
        return this;
    }

    /** add a budget query onto the match stage
     *  @param {Number} [min] min budget in a trip
     *  @param {Number} [max] max budget in a trip
     *  @return {Instance}
     */
    budget(min, max) {
        if (!min && !max) return this;
        this.$match.budget = { middleBound: {} };
        let mb = this.$match.budget.middleBound;
        if (min) mb.$gte = min;
        if (max) mb.$lte = max;
        return this;
    }
}

module.exports = MatchStage;