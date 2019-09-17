class TripsPipeline {
    constructor({ featured = false } = {}) {
        this.pipeline = [];
        this.$match = {};
        this.$addFields = {};
        this.$project = {};
        this.$limit = {};
        this.featured = featured;
    }

    text(text) {
        if (!text) return this;
        this.$match.$text = { $search: text }
        return this;
    }

    budget(min, max) {
        if (!min && !max) return this;
        this.$match['budget.middleBound'] = {};
        let mb = this.$match['budget.middleBound'];
        if (min) mb.$gte = min;
        if (max) mb.$lte = max;
        return this;
    }

    tags(tags) {
        if (!tags) return this;
        this.$match.tags = { $all: tags.replace(/\s+/g, '').split(',') }
        return this;
    }

    _set_featured(type) {
        let stages = [{
            $addFields: {
                featuredScore: {
                    $add: [
                        { $multiply: ["$meta.likes", 2] },
                        { $multiply: ["$meta.numberOfShares", 3] },
                        '$meta.viewCount'
                    ]
                }
            }
        },
        { "$sort": { 'featuredScore': -1 } },
        { $project: { 'featuredScore': 0 } }
        ];
        for (let i in stages) {
            this.pipeline.push(stages[i])
        }
    }

    select({ paths, omit } = {}) {
        if (!paths && !omit) return this;
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
        if (!pagenation) return this;
        this.$limit = pagenation;
        return this;
    }

    build() {
        for (let stage in this) {
            if ((this[stage] !== this.pipeline) && (Object.entries(this[stage]).length !== 0))
                this.pipeline.push({ [stage]: this[stage] })
            else continue
        }
        if (this.pipeline.length === 0) this.pipeline.push({ $match: {} })
        if (this.featured) this._set_featured()
        return this.pipeline;
    }
}

module.exports = TripsPipeline;