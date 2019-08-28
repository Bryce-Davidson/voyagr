
const { getRandom, getRandomInt, randomGeoFromSeed } = require('../local-functions/randomFunctions');

const descriptions    = "hey I love walking around here and there is so much sun for everyone that I love it and it's great lots of swimming".split(' ');
const locationNames   = "Europe Canada Mexico France Italy USA Dubai".split(' ');
const peopleNames     = "Katie Bryce Cindy Robert Gabby Teressa".split(' ');
const dayNames        = "Harbour Walking Swimming Kyaking History Surfing".split(' ');
const cityNames       = "Paris Florence Victoria Vancouver Venice Nice Rome London".split(' ');
const tags            = "walking swimming boating boat water beach sunny view sunset sunrise breakfast dinner".split(' ');

var victoria = {latitude: 48.4529784, longitude: -123.46109239999998};

const emailsAndPasswords = [["lifebryce@gmail.com", "admin1", "brycd"], ["bryce678@gmail.com", "froggo678", "james"], ["katie@icloud.com", "superkid", "sauce"]];

const Day = require('../../models/Day/DaySchema');
const Trip = require('../../models/Trip/TripSchema');
const User = require('../../models/User/UserSchema');
const Location = require('../../models/Location/LocationSchema.js');

require('../../database');

async function createTripWithUser(numTrips, DaysInTrip, LocsInDay) {
    
    // loop all code below numTrips amount of times
    for (var i = 0; i < numTrips; i++) {
        // create user for both days and trip
        var userEPU = getRandom(emailsAndPasswords, 1)[0];
        let user = await User.create({'local.email': userEPU[0], 'local.password': userEPU[1], 'local.username': userEPU[2]})
        // create new trip in memory to get the trip id
        let trip = await loadTrip(user);
        // create days with trip id and return dayids list
        
        let daysAndLocations = await createDays(DaysInTrip, trip, user, LocsInDay)
        // add days id list to trip in memory and then save
        trip.days = daysAndLocations[0];
        trip.locations = daysAndLocations[1];

        await trip.save().then(trip => {
            console.log(`Created Trip: "${trip.name}" w/ ${DaysInTrip} Days & ${DaysInTrip * LocsInDay} Locations`)
            if (i == numTrips - 1) {process.exit()}
        }).catch(console.log)
    }
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

async function createLocations(numLocations, trip) {
    let locations = [];
    let coordinates = randomGeoFromSeed(victoria, 10000)
    for(var i=0; i < numLocations; i++) {
        await Location.create({
            "trips": [trip],
            "name": "A Name",
            "description": "A Description",
            "location": {
              "type": "Point",
              "coordinates": coordinates
            },
            meta: {
                view_count: getRandomInt(0, 3000),
                numberOfComments: getRandomInt(0, 300),
                likes: getRandomInt(0, 100),
                numberOfShares: getRandomInt(0, 30)
            }})
          .then(loc => {
              locations.push(loc._id)
          })
          .catch(console.log)
    }
    return locations;
}

async function createDays(numDays, trip, user, locPerDay) {
    let days = [];
    let locationsInTrip = [];
    for (var i=0; i < numDays; i++) {
        let locations = await createLocations(locPerDay, trip);
        locations.forEach(loc => locationsInTrip.push(loc));
        await Day.create({
            user,
            trip,
            locations,
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
    return [days, locationsInTrip];
}

var setUp = process.argv.slice(2)

var tripsA = setUp[0];
var daysA  = setUp[1];
var locationspday = setUp[2];

createTripWithUser(tripsA, daysA, locationspday);