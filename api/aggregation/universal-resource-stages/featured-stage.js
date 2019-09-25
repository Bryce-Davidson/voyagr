const Stages = require('./parent-stage');

//NOTE: 
    // when adding complex additions of featured stages we need to introduce 
    // variable coefficients so the sort order feature score is not taken at face value

/** 
 * a multi-stage process to get fetured resources based on some criteria
 * @param {Number} [sortDirection] will we sort by LEAST or MOST
 * @param {Number} [index] index of the featured stage in the future pipeline
 * @example
 * let stage = new FeatureStage(88, -1).by('likes,views,shares')
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
        this.can_add_stages = true;
        this.popular_can_be_called = true;
    }

    get stage() {
        return [this.featured_stage, this.sort_stage, this.clean_stage]
    }

    by(featured_by) {
        if (!featured_by)
            return this;
        featured_by.replace(/\s+/g, '').split(',').forEach(by => {
            if (by === 'popular') { this.byMostPopular() };
            if (by === 'likes') { this.byLikes(1) };
            if (by === 'views') { this.byViewCount(1) };
            if (by === 'shares') { this.byShares(1) };
        });
        return this;
    }

    byMostPopular() {
        if (this.popular_can_be_called) {
            this.byLikes(2).byShares(3).byViewCount(1);
            this.can_add_stages = false;
            this.has_field = true;
        } else
            throw new Error('Cannot call most popular after previous method calls.');
        return this;
    };

    and() { return this; };

    byLikes(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for: byLikes()`);
        if (this.can_add_stages) {
            this.popular_can_be_called = false;
            this.$add.push({ $multiply: ["$meta.likes", coefficient] });
            this.has_field = true;
        } else
            throw new Error('Cannot add more stages after popular call')
        return this;
    };

    byViewCount(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for: byViewCount()`);
        if (this.can_add_stages) {
            this.popular_can_be_called = false;
            this.$add.push({ $multiply: ['$meta.viewCount', coefficient] });
            this.has_field = true;
        } else
            throw new Error('Cannot add more stages after popular call')
        return this;
    };

    byShares(coefficient) {
        if (!coefficient) throw new Error(`Missing coefficient for byShares()`);
        if (this.can_add_stages) {
        this.popular_can_be_called = false;
        this.$add.push({ $multiply: ["$meta.numberOfShares", coefficient] });
        this.has_field = true;
        } else 
            throw new Error('Cannot add more stages after popular call')
        return this;
    };
}

module.exports = FeatureStage;