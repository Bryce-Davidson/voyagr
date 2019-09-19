const Trip = require('../../../models/Trip/TripSchema');

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
     *  @param {Object} [query] the desired query to add into
    */
    query(query) {
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

let match = new trip_MatchStage(0).budget(1000, 4000).text('Why hello there').tags(["one", 1])

/** 
 * Description: 
 *      generate a stage made up of the correct stages to get the featured items from trips
 * @param {Number} [sortDirection] will we sort by LEAST popular or MOST popular
 * @param {Number} [index] index of the featured stage in the future pipeline
*/

class FeatureStage {
    constructor(sortDirection, index) {
        this.index = index;
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

class v_Trip {
    constructor() {
        this.pipeline = [];
        this.$match = {};
        this.$addFields = {};
        this.$project = {};
        this.$limit = {};
    }

    static where() {
        return new v_Trip();
    }

    text(text) {
        if (arguments.length === 0) return this;
        this.$match.$text = { $search: text }
        return this;
    }

    budget(min, max) {
        if (arguments.length === 0) return this;
        this.$match['budget.middleBound'] = {};
        let mb = this.$match['budget.middleBound'];
        if (min) mb.$gte = min;
        if (max) mb.$lte = max;
        return this;
    }

    tags(tags) {
        if (arguments.length === 0) return this;
        if (tags instanceof Array) {
            tags.forEach(i => {
                if (!(i instanceof String)) {
                    throw new Error(`Tags array must only contain strings. got ${typeof i}`)
                }
            })
            this.$match.tags = { $all: tags }
        } else
            this.$match.tags = { $all: tags.replace(/\s+/g, '').split(',') }
        return this;
    }

    featuredBy({ mostPopular, likes, views, shares, near } = {}) {
        if (arguments.length === 0) return this;

        this.$addFields.featuredScore = { $add: [] };
        let $add = this.$addFields.featuredScore.$add;
        let bylikes = { $multiply: ["$meta.likes", 2] };
        let byShares = { $multiply: ["$meta.numberOfShares", 3] };
        let byViewCount = '$meta.viewCount';

        if (near) {
            // write the code to aggregate trip loctions and sum them into
            // a single document
        }
        if (mostPopular) {
            $add.push(bylikes, byShares, byViewCount)
            return this;
        }
        if (likes) $add.push(bylikes);
        if (views) $add.push(byViewCount);
        if (shares) $add.push(byShares);
        return this;
    }

    select({ paths, omit } = {}) {
        if (arguments.length === 0) return this;
        if (paths) {
            paths.replace(/\s+/g, '').split(',').forEach(p => {
                this.$project[p] = 1;
            });
        }
        if (omit) {
            omit.replace(/\s+/g, '').split(',').forEach(p => {
                this.$project[p] = 0;
            });
        }
        return this;
    }

    limit(pagenation) {
        if (arguments.length === 0) return this;
        this.$limit = pagenation;
        return this;
    }

    // will return the raw pipeline
    build() {
        for (let stage in this) {
            if ((this[stage] !== this.pipeline) && (Object.entries(this[stage]).length !== 0))
                this.pipeline.push({ [stage]: this[stage] })
            else continue
        }
        if (this.pipeline.length === 0) this.pipeline.push({ $match: {} })
        if (Object.entries(this.$addFields).length !== 0) {
            this.pipeline = this.pipeline.concat(clean)
        }
        return this.pipeline;
    }

    exec() {
        this.build()
        return Trip.aggregate(this.pipeline)
    }
}

module.exports = v_Trip;