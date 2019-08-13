
const { getRandom, getRandomInt } = require('../local-functions/randomFunctions');

const descriptions    = "hey I love walking around here and there is so much sun for everyone that I love it and it's great lots of swimming".split(' ');
const locationNames   = "Europe Canada Mexico France Italy USA Dubai".split(' ');
const peopleNames     = "Katie Bryce Cindy Robert Gabby Teressa".split(' ');
const dayNames        = "Harbour Walking Swimming Kyaking History Surfing".split(' ');
const cityNames       = "Paris Florence Victoria Vancouver Venice Nice Rome London".split(' ');
const tags            = "walking swimming boating boat water beach sunny view sunset sunrise breakfast dinner".split(' ');

const emailsAndPasswords = [["lifebryce@gmail.com", "admin1"], ["bryce678@gmail.com", "froggo678"], ["katie@icloud.com", "superkid"]];

const Day = require('../../models/Day/DaySchema');
const Trip = require('../../models/Trip/TripSchema');
const User = require('../../models/User/UserSchema');

require('../../database');

async function createTripWithUser(numDays) {
    // create user for both days and trip
    var userEP = getRandom(emailsAndPasswords, 1)[0];
    let user = await User.create({'local.email': userEP[0], 'local.password': userEP[1]})
    // create new trip in memory to get the trip id
    let trip = await loadTrip(user);
    // create days with trip id and return dayids list
    let dayids = await createDays(3, trip, user)
    // add days id list to trip in memory and then save
    trip.days = dayids;
    await trip.save().then(trip => {
        console.log(`Seeded 1 Trip with ${numDays} Days each`)
        process.exit()
    }).catch(console.log)
}


function loadTrip(user) {
    return new Trip({
        user,
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
        }})
}

async function createDays(num, trip, user) {
    let days = [];
    for (var i=0; i < num; i++) {
        await Day.create({
            user,
            trip,
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
        .then(day => {
            days.push(day._id)
        })
        .catch(console.log)
    }
    return days;
}

createTripWithUser(3)