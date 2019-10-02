const mongoose = require('mongoose');

module.exports = {
    user: {
        local: {
            email: 'testuser@mail.com',
            password: 'testPassword',
            username: 'tester'
        }
    },
    user_2: {
        local: {
            email: 'testuser2@mail.com',
            password: 'testPassword',
            username: 'tester2'
        }
    },
    trip_1: {
        "name": "Mexico 2019 - Bryce",
        "description": "A crazy booze filled trip for one",
        "tags": ["test", "one", "two", "three"],
        "upperBound": 1000,
        "lowerBound": 500,
        "currency": "usd",
        "public": true
    },
    trip_2: {
        "name": "Europe 2022 - Katie",
        "description": "A trip to take after graduating from university.",
        "tags": ["France", "Sweeden", "Spain", "Germany"],
        "upperBound": 1000,
        "lowerBound": 500,
        "currency": "cad",
        "public": true
    },
    day_1: {
        "name": "Walk around day",
        "description": "A day for walking around Rome",
        "tags": ["Rome", "Statues", "History"],
        "upperBound": 100,
        "lowerBound": 0,
        "currency": "cad",
        "public": true
    },
    save_day: {
        "name": "Sailing in Rome",
        "slug": "just-a-test-day",
        "description": "A day for sailing and enjoying drinks",
        "tags": ["Sea", "Ocean", "Water", "Swimming"],
        "settings": {
            "public": true
        },
        "meta": {
            "urlid": "Hae4NsQ"
        },
        "budget": {
            "upperBound": 100,
            "lowerBound": 0,
            "currency": "cad",
        }
    },
    save_location: {
        "name": "Test Location",
        "slug": "some-test-location",
        "typeOfLocation": "Restaurant",
        "description": "Test location and should be deleted",
        "tags": ["one", "two", "three"],
        "meta": {
            "urlid": "h897tf86"
        },
        "budget": {
            "upperBound": 1000,
            "lowerBound": 500,
            "currency": "cad"
        },
        "location": {
            "type": "Point",
            "coordinates": [40.7143528, -74.0059731],
          },
    }
}