const Stages = require('./parent-stage');

/** 
 * generate a stage made up of the multiple stages to get the featured items from trips
 * @param {Number} [sortDirection] will we sort by LEAST popular or MOST popular
 * @param {Number} [index] index of the featured stage in the future pipeline
 * @return {Instance}
*/

// TODO:[] write docs for v_FeaturedSatge class

class FeatureStage extends Stages {
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

module.exports = FeatureStage;