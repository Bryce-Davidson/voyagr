// HELPERS -----------------------------------

const { getRandom, getRandomInt } = require('../local-functions/randomFunctions');

// Trips -------------------------------------
const Day = require('../../models/Day/DaySchema');

const dayNames      = "Harbour Day-Walking Day-Swimming Day-History Day-Art Day".split('-');
const cityNames     = "Paris Venice Florence Nice".split(' ');
const tags          = "Love Walking Harbour Cafe Bagels Coffee Art ".toLocaleLowerCase().split(' ');
const descriptions  = "a wonderful walk for a couple of people that really wan't to stay in a remote location for love".split(' ')

module.exports = function(ndocs) {
    for (i = 0; i < ndocs; i++) { 
            Day.create({
                name: `${getRandom(dayNames, 1)} ${getRandom(cityNames, 1)} - ${getRandomInt(2019, 2050)}`,
                description: getRandom(descriptions, 8).join(' '),
                settings: {
                    private: Math.random() > 0.8
                },
                meta: {
                    view_count: getRandomInt(0, 3000),
                    tags: getRandom(tags, 5),
                    numberOfComments: getRandomInt(0, 300),
                    likes: getRandomInt(0, 100),
                    numberOfShares: getRandomInt(0, 30)
                }
            })
            .then(doc => {})
            .catch(err => console.log(err))
    }
}
