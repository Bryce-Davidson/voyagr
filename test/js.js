let match_stage = {$match: {}}
let $match = match_stage.$match;

$match.$text = { $search: "some text" };
$match.tags = {$all: 'some,tags,for,you'.split(',') }
console.log($match)
