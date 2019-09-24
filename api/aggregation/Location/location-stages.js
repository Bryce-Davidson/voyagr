const u_Match    = require('../universal-resource-stages/match-stage');
const u_Project  = require('../universal-resource-stages/project-stage');
const u_Limit    = require('../universal-resource-stages/limit-stage');
const u_Featured = require('../universal-resource-stages/featured-stage');

class location_Match extends u_Match {
    constructor(_index) {
        super(_index)

        //TODO:[] integrate location near ability
        // lay out custom aggregation stages here...


        //
    }
}

class location_Project extends u_Project {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

class location_Limit extends u_Limit {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

class location_Featured extends u_Featured {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

module.exports = {
    location_Featured,
    location_Limit,
    location_Match,
    location_Project
}