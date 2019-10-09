const slugify = require('../../util/local-functions/slugify-string');

async function deleteKeyByString(string, obj) {
        for (var k in obj)
            if(~k.indexOf(string));
                delete obj[k]
}

async function deleteUndefinedKeys(obj) {
    for(var k in obj) {
        if(obj[k] === undefined) {
            delete obj[k]
        }
    }
}

async function generateUpdate(update) { 
    // key selection
    let qurantined = ({name, description, budget, settings} = update, {name, description, budget, settings})
    if (qurantined.name)
        qurantined.slug = await slugify(qurantined.name);
    if (qurantined.budget)
        await deleteKeyByString('middle', qurantined.budget)
    await deleteUndefinedKeys(qurantined)
    return qurantined;
}

module.exports = generateUpdate;
