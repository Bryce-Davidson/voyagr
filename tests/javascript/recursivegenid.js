const shortid = require('shortid');

function genUniqueId(slug) {
    let urlid = shortid.generate();
    let random = Math.floor( Math.random () * (10 - 1 + 1)) + 1;
    if(random === 3) {
        console.log('No Match')
        return `WINNER: ${urlid}`;
    } else {
        console.log(`Found Match for ${urlid}`)
        return genUniqueId(slug);
    }
}

let newid = genUniqueId('My Slug')
console.log(newid)
