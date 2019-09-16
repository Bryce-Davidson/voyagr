let $match = {};
let $project = {};
let pipeline = [];

$match.$text = { $search: 'Some text' }

let paths = ['_id', 'name']
paths.forEach(p => {
    $project[p] = 1
})

$match['settings.public'] = true;

pipeline.push({$match}, {$project})
console.log(pipeline)
