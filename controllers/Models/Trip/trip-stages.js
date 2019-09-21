const Trip = require('../../../models/Trip/TripSchema');

/**
 * parent class for all the stage classes
 * if the index is not specified we take the next index in line
 * @param {Number} [index] the index of the stage being created
 */

class Stages {
    static stage_count = -1;
    constructor(_index) {
        Stages.stage_count++
        this.index = _index || Stages.stage_count;
    }
}


/**
 * a $limit stage for a mongo pipeline
 * @param {Number} [index] the index of the limit stage in a pipeline
 * @param {Number} [pagenation] how many documents get returned after the stage
 * @return {Instance}
 */

class v_trip_LimitStage extends Stages {
    constructor(_index, _pagenation) {
        super(_index)
        this.stage = {$limit: _pagenation}
    }
}

/** 
 * a $project stage for a mongo pipeline
 * @param {Number} [index] the index to be included in the pipeline
 * @return {Instance}
*/

class v_ProjectStage extends Stages{
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

/**
 * create a match stage to insert into a mongodb pipeline with a desired index
 * ##Example:
 *          new MatchStage(index for pipeline)
 *          new MatchStage(0).tags("hello,there") 
 * 
 * @param {Object} [query] for the mongo documents
 * @param {Number} [index] index of the stage for the pipeline
 * @return {Instance}
 * @api public
 */

class v_MatchStage extends Stages {
    constructor(_index) {
        super(_index)
        this.stage = { $match: {} };
        this.$match = this.stage.$match;
    }

    /** add a custom match body
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
        if(this.index !== 0)
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


/** 
 * generate a stage made up of the multiple stages to get the featured items from trips
 * @param {Number} [sortDirection] will we sort by LEAST popular or MOST popular
 * @param {Number} [index] index of the featured stage in the future pipeline
 * @return {Instance}
*/

// TODO:
    // [] write docs for v_trip_FeaturedSatge class
            // on all functions

class v_trip_FeatureStage extends Stages {
    constructor(_index, sortDirection) {
        super(_index)
        this.sortDirection = sortDirection;
        this.stage = { $addFields: { featuredScore: { $add: [] } } }
        this.$add = this.stage.$addFields.featuredScore.$add;
        this.popular_callable = true;
    }

    byMostPopular() {
        if (this.popular_callable)
            this.byLikes(2).byShares(3).byViewCount(1)
        else
            throw new Error('Cannot call most popular after previous method calls.');
        return this;
    };

    and() { return this; };

    byLikes(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for: byLikes()`);
        this.popular_callable = false;
        this.$add.push({ $multiply: ["$meta.likes", coefficient] });
        return this;
    };

    byViewCount(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for: byViewCount()`);
        this.popular_callable = false;
        this.$add.push({ $multiply: ['$meta.viewCount', coefficient] });
        return this;
    };

    byShares(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for byShares()`);
        this.popular_callable = false;
        this.$add.push({ $multiply: ["$meta.numberOfShares", coefficient] });
        return this;
    };
}

module.exports ={
    v_trip_FeatureStage,
    v_MatchStage,
    v_ProjectStage,
    v_trip_LimitStage
}