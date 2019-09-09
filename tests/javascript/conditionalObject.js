// Here is an example of updating current items in an object with other values, almost to overwrite them
let photos = {
    banner: 'blahblahblah',
    banner350: 'ohohohohoh'
}

let update = {
    banner: 'updated',
}

photos = {...photos, ...update}
console.log(photos)


function queryBuilder(query) {
    // handle all allowable search logic here
    let { tags, near, type, text } = query;
    if (near && (type != 'location')) return 'Please use locations to use near'
    if (near && text) return 'connot search locations by near and text'
    return {
        ...tags && {tags: tags.replace(/ /g,'').split(',') },
        ...near && {
            $near: { 
                point: near.split(',')[0] ,
                distance: Number(near.split(',')[1])
            }
        }
    }
}

console.log(
    queryBuilder({tags: 'haha , oh, my', near: '124.23-231.312,10000', type: 'location'})
    )

function checker() {
    return {
        
    }
}