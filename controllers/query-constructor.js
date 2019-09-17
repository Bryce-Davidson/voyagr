
class TripsQuery {
    constructor({ featured = false }) {
        // this is the order of the pipeline
        this.pipeline = [];
        this.$match = {};
        this.$addFields = {};
        this.$project = {};
        this.$limit = {};
        this.featured = featured;
    }

    text(text) {
        this.$match.$text = { $search: text }
        return this;
    }

    budget(min, max) {
        this.$match['budget.middleBound'] = {};
        let mb = this.$match['budget.middleBound'];
        if (min) mb.$gte = min;
        if (max) mb.$lte = max;
        return this;
    }

    tags(tags) {
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

    select({paths, omit}) {
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
        this.$limit = pagenation;
        return this;
    }

    build() {
        for (let stage in this) {
            if ((this[stage] !== this.pipeline) && (Object.entries(this[stage]).length !== 0)) {
                this.pipeline.push({ [stage]: this[stage] })
            } else
                continue
        }
        if (this.featured) this._set_featured()
        return this.pipeline;
    }

    then() { return this }
}

let new_pipe = new TripsQuery({ featured: true })
    .text("Hello There")
    .budget(100, 50)
    .tags('some,tags')
    .select({paths: 'name,description', omit: '_id'})
    .build()
console.log(new_pipe)


// class Mongo_Pipeline {
//     constructor({text, tags, paths, omit, featured, min_budget, max_budget, pagenation}) {
//         this.pipeline = [];
//         this.text = text && this.gen_text_stage(text);
//         this.tags = tags && this.gen_tags_stage(tags);
//         this.paths = paths && this.gen_paths_stage(paths);
//         this.omit = omit && this.gen_omit_stage(omit);
//         this.budget = (min_budget || max_budget) && this.gen_budget_stage(min_budget, max_budget);
//         this.pagenation = pagenation && this.gen_pagenation_stage(pagenation);
//         this.featured = featured;
//         if (!this.text) {
//             this.set_blank_head_stage()
//         }
//     }

//     gen_text_stage(text) {
//         return { $match: { $text: { $search: text } } };
//     }

//     gen_tags_stage(tags) {
//         return { $match: { tags: { $all: tags.replace(/\s+/g, '').split(',') } } };
//     }

//     gen_paths_projection(paths, omit) {
//         let stage = { $project: {} };
//         if (paths) {
//             paths = paths.replace(/\s+/g, '').split(',')
//             paths.forEach(p => {
//                 stage.$project[p] = 1;
//             })
//         }
//         if (omit) {
//             omit = omit.replace(/\s+/g, '').split(',')
//             omit.forEach(o => {
//                 stage.$project[o] = 0;
//             })
//         }
//     }

//     gen_pagenation_stage(pagenation) {
//         return { $limit: Number(pagenation) }
//     }

//     gen_budget_stage(min, max) {
//         let stage = { $match: { 'budget.middleBound': {} } };
//         const budget = stage.$match['budget.middleBound'];
//         if (min) budget.$gte = min;
//         if (max) budget.$lte = max;
//         return stage;
//     }

//     set_featured_stages() {
//         let stage = [{
//             $addFields: {
//                 featuredScore: {
//                     $add: [
//                         { $multiply: ["$meta.likes", 2] },
//                         { $multiply: ["$meta.numberOfShares", 3] },
//                         '$meta.viewCount'
//                     ]
//                 }
//             }
//         },
//         { "$sort": { 'featuredScore': -1 } },
//         { $project: { 'featuredScore': 0 } }];
//         this.pipeline = this.pipeline.concat(stage)
//     }

//     set_blank_head_stage() {
//         this.pipeline.push({ $match: {} })
//     }

//     set_private_tail_stage() {
//         this.pipeline.push({ $match: { 'settings.public': true } })
//     }

//     compile() {
//         for (var key in this) {
//             if (this[key] !== undefined && this[key] !== this.pipeline && (key !== 'featured'))
//                 this.pipeline.push(this[key])
//             else continue;
//         }
//         this.featured && this.set_featured_stages()
//         this.set_private_tail_stage()
//         return this.pipeline
//     }

// }
// let query = { text: 'some text', featured: true }
// let query2 = { tags: 'some,tags,for, you' }

// let pipeline = new Mongo_Pipeline(query).compile()
// console.log(pipeline)



// function generate_pipeline() {
//     let { text, tags, paths, omit, featured, min_budget, max_budget, pagenation} = arguments[0];
//     let pipeline = [];
//     // text has to be the first stage otherwise we get errors
//     // TODO:
//     if (text) {
//         let stage = { $match: { $text: { $search: text } } };
//         pipeline.push(stage);
//     } else {
//         // if there is already a first stage we don't need another blank top stage
//         pipeline.push({$match: {}})
//     };
//     if (featured) {
//         let stage = [{
//                 $addFields: {
//                     featuredScore: {
//                         $add: [
//                             { $multiply: ["$meta.likes", 2] },
//                             { $multiply: ["$meta.numberOfShares", 3] },
//                             '$meta.viewCount'
//                         ]
//                     }
//                 }
//             },
//             { "$sort": { 'featuredScore': -1 } },
//             { $project: { 'featuredScore': 0 } },
//         ];
//         pipeline = pipeline.concat(stage)
//     };
//     if (tags) {
//         let stage = { $match: { tags: { $all: tags.replace(/\s+/g, '').split(',') } } };
//         pipeline.push(stage);
//     };
//     if (min_budget || max_budget) {
//         let min_budget = min_budget;
//         let max_budget = max_budget;
//         let stage = { $match: { 'budget.middleBound': {} } };
//         const budget = stage.$match['budget.middleBound'];
//         if (min_budget) budget.$gte = min_budget;
//         if (max_budget) budget.$lte = max_budget;
//         pipeline.push(stage);
//     };
//     if (paths) {
//         let paths = path;
//         let stage = {$project: {}}
//         paths = paths.replace(/\s+/g, '').split(',')
//         paths.forEach(p => {
//             stage.$project[p] = 1;
//         })
//         pipeline.push(stage)
//     };
//     if (omit) { 
//         let omit = omit;
//         let stage = {$project: {}}
//         omit = omit.replace(/\s+/g, '').split(',')
//         omit.forEach(o => {
//             stage.$project[o] = 0;
//         })
//         pipeline.push(stage)
//     };
//     if (pagenation) {
//         let stage = {$limit: Number(pagenation)}
//         pipeline.push(stage)
//     }
//     pipeline.push({$match: { 'settings.public': true }})
//     return pipeline;
// }