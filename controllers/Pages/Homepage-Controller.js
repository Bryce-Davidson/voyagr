const Locations = require('../../models/Location/LocationSchema');

// TODO:
    // on the homepage will be a panel showing the featured locations for: 
            // - near user 25km (adjustable)
            // - within country
            // - within world


const homepage = {
    get: async (req, res, next) => {
        // query DB for locations:
                // near 25km of Userpoint
                    // sorted: view count
                // within country polygon
                    // sorted: view count
                // all locations
                    // sorted: view count
    
        // query for nearest panel
            // closet to current location
    }
  }

