module.exports = function buildSearchQuery(reqQuery) {
    let { text, tags, min_budget, max_budget, paths, omit } = reqQuery;
    let query = {};
    if (paths) { paths = paths.replace(/,/g, ' ') };
    if (omit) { omit = omit.split(',').map(item => `-${item}`).join(' ') };
    if (tags) { query['tags'] = { $all: tags.split(',') } };
    if (text) { query.$text = { $search: text } };
    if (min_budget || max_budget) {
        const mb = query['budget.middleBound'] = {};
        if (min_budget) mb.$gte = min_budget;
        if (max_budget) mb.$lte = max_budget;
    };
    return query;
}