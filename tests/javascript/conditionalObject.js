function buildQuery(text, tags) {
    return {
        ...(tags && {tags}),
        $text : {
            $search: ...(text && {text})
        }
    }
}

console.log(buildQuery('hello there'))