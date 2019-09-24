const Stages = require('./parent-stage');

//TODO:[] add docs and sort order example 

/** 
 * a multi-stage process to get fetured resources based on some criteria
 * @param {Number} [sortDirection] will we sort by LEAST or MOST
 * @param {Number} [index] index of the featured stage in the future pipeline
 * @return {Instance}
*/

// TODO:[] write docs for v_FeaturedSatge class

class FeatureStage extends Stages {
    constructor(_index, _sortDirection) {
        super(_index)
        this.has_field = false;
        this.sortDirection = _sortDirection;
        this.featured_stage = { $addFields: { featuredScore: { $add: [] } } }
        this.sort_stage = { "$sort": { 'featuredScore': _sortDirection } };
        this.clean_stage = { $project: { 'featuredScore': 0 } }
        this.$add = this.featured_stage.$addFields.featuredScore.$add;
        this.popular_callable = true;
    }

    get stage() {
        return [this.featured_stage, this.sort_stage, this.clean_stage]
    }

    by(by) {
        //TODO: rethink stage creation...
    }

    byMostPopular() {
        if (this.popular_callable) {
            this.byLikes(2).byShares(3).byViewCount(1)
            this.has_field = true;
        } else
            throw new Error('Cannot call most popular after previous method calls.');
        return this;
    };

    and() { return this; };

    byLikes(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for: byLikes()`);
        this.popular_callable = false;
        this.$add.push({ $multiply: ["$meta.likes", coefficient] });
        this.has_field = true;
        return this;
    };

    byViewCount(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for: byViewCount()`);
        this.popular_callable = false;
        this.$add.push({ $multiply: ['$meta.viewCount', coefficient] });
        this.has_field = true;
        return this;
    };

    byShares(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for byShares()`);
        this.popular_callable = false;
        this.$add.push({ $multiply: ["$meta.numberOfShares", coefficient] });
        this.has_field = true;
        return this;
    };
}

module.exports = FeatureStage;