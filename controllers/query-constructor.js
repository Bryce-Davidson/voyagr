function generate_pipeline() {
    let { text, tags, paths, omit, featured, min_budget, max_budget, pagenation} = arguments[0];
    let pipeline = [];
    // text has to be the first stage otherwise we get errors
    // TODO:
    if (text) {
        let stage = { $match: { $text: { $search: text } } };
        pipeline.push(stage);
    } else {
        // if there is already a first stage we don't need another blank top stage
        pipeline.push({$match: {}})
    };
    if (featured) {
        let stage = [{
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
            { $project: { 'featuredScore': 0 } },
        ];
        pipeline = pipeline.concat(stage)
    };
    if (tags) {
        let stage = { $match: { tags: { $all: tags.replace(/\s+/g, '').split(',') } } };
        pipeline.push(stage);
    };
    if (min_budget || max_budget) {
        let min_budget = min_budget;
        let max_budget = max_budget;
        let stage = { $match: { 'budget.middleBound': {} } };
        const budget = stage.$match['budget.middleBound'];
        if (min_budget) budget.$gte = min_budget;
        if (max_budget) budget.$lte = max_budget;
        pipeline.push(stage);
    };
    if (paths) {
        let paths = path;
        let stage = {$project: {}}
        paths = paths.replace(/\s+/g, '').split(',')
        paths.forEach(p => {
            stage.$project[p] = 1;
        })
        pipeline.push(stage)
    };
    if (omit) { 
        let omit = omit;
        let stage = {$project: {}}
        omit = omit.replace(/\s+/g, '').split(',')
        omit.forEach(o => {
            stage.$project[o] = 0;
        })
        pipeline.push(stage)
    };
    if (pagenation) {
        let stage = {$limit: Number(pagenation)}
        pipeline.push(stage)
    }
    pipeline.push({$match: { 'settings.public': true }})
    return pipeline;
}

console.log(generate_pipeline({
    text: 'hey there',
    tags: '1,2,3,4',
    min_budget: 1000,
    max_budget: 10
}))