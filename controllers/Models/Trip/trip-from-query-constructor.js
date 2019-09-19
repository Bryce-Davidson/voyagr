const Trip = require('../../../models/Trip/TripSchema');

/** 
 * a project stage to select paths on the trips object before returning
 * @param {Number} [index] the index to be included in the pipeline
*/

class trip_ProjectStage {
    constructor(index) {
        this.index = index;
        this.stage = {$project: {}}
        this.$project = this.stage.$project;
    }

    /**
     * include paths in the return documents of the query
     * @param {String|Array} [paths] the paths to include in query
     */
    paths(paths) {
        if(!paths) return this;
        if (paths) {
            paths.replace(/\s+/g, '').split(',').forEach(p => {
                this.$project[p] = 1;
            });
        };
        return this;
    }

    /**
     * Omit paths from the return documents of query
     * @param {String|Array} [omit] 
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
 * #Description:
 *          create a match stage to insert into a mongodb pipeline with a desired index
 * ##Example:
 *          new MatchStage({tags : ["some", "tags", "for"]}, 0)
 * 
 * ###Explanation:
 *          allows to create a match stage with index where it will get inserted
 *          at the fron tof the array
 * 
 * @param {Object} [query] for the mongo documents
 * @param {Number} [index] index of the stage for the pipeline
 * @api public
 */

class trip_MatchStage {
    constructor(index) {
        this.index = index;
        this.stage = { $match: {} };
        this.$match = this.stage.$match;
    }

    /** add in a custom match body and not having to invoke any methods.
     *  @param {Object} [custom] the desired query to add into
    */
    custom(query) {
        if (!query) return this;
        this.$match = query;
        return this;
    }

    /**  add in a text search to the match stage
     *   @param {String} [text] the text to be added into the query
    */
    text(text) {
        if (!text) return this;
        this.index = 0;
        this.$match.$text = { $search: text };
        return this;
    }

    /** add the tags to a match query by utilising the array split methods 
     *  @param {Number|Array} [tags] query will match all tags
    */
    tags(tags) {
        if (!tags) return this;
        if (tags instanceof Array) {
            tags.forEach(i => {
                if((typeof i !== 'string')) {
                    throw new Error(`Tags array may only contain strings got: ${typeof i}`)
                }
            })
            this.$match.tags = { $all: tags }
        } else
            this.$match.tags = { $all: tags.replace(/\s+/g, '').split(',') }
        return this;
    }

    /** to add a budget query onto the match stage
     *  @param {Number} [min] min budget in a trip
     *  @param {Number} [max] max budget in a trip
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
 * Description: 
 *      generate a stage made up of the correct stages to get the featured items from trips
 * @param {Number} [sortDirection] will we sort by LEAST popular or MOST popular
 * @param {Number} [index] index of the featured stage in the future pipeline
*/

class FeatureStage {
    constructor(index, sortDirection) {
        this.index = index;
        this.sortDirection = sortDirection;
        this.stage = { $addFields: { featuredScore: { $add: [] } } }
        this.$add = this.stage.$addFields.featuredScore.$add;
    }

    byMostPopular() {
        this.byLikes(2).byShares(3).byViewCount(1)
        return this.stage;
    };

    and() { return this; };

    byLikes(coefficient) {
        this.$add.push({ $multiply: ["$meta.likes", coefficient] })
        return this;
    };

    byViewCount(coefficient) {
        this.$add.push({ $multiply: ['$meta.viewCount', coefficient] })
        return this;
    };

    byShares(coefficient) {
        this.$add.push({ $multiply: ["$meta.numberOfShares", coefficient] });
        return this;
    };
}

module.exports = v_Trip;