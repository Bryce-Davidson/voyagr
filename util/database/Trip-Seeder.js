// HELPERS -----------------------------------

const { getRandom, getRandomInt } = require('../local-functions/randomFunctions');


// Trips -------------------------------------
const { getObjectId } = require('mongoose');
const Trip = require('../../models/Trip/TripSchema');

const locationNames = ["Europe", "Mexico", "Spain", "France", "Canada", "USA"]
const peopleNames   = ["Bryce", "Kate", "Robert", "Gabby", "Teressa", "Lamp"]
const descriptions  = ["love", "it", "here", "can't", "sunset", "beach", "open", "water", "walking", 'wait', 'when', 'we', 'went', 'never', 'leave']
const tags          = ['water', 'boats', 'fishing', 'family', 'sunset', 'flowers', 'harbour', 'running', 'relaxing']

module.exports = function(ndocs) {
    for (i = 0; i < ndocs; i++) { 
            Trip.create({
                name: `${locationNames[getRandomInt(0, 6)]} ${getRandomInt(2019, 2050)} - ${peopleNames[getRandomInt(0, 6)]}`,
                description: getRandom(descriptions, 8).join(' '),
                settings: {
                    private: Math.random() > 0.8
                },
                meta: {
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
