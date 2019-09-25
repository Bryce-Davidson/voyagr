const u_Match    = require('../universal-resource-stages/match-stage');
const u_Project  = require('../universal-resource-stages/project-stage');
const u_Limit    = require('../universal-resource-stages/limit-stage');
const u_Featured = require('../universal-resource-stages/featured-stage');

class day_Match extends u_Match {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

class day_Project extends u_Project {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

class day_Limit extends u_Limit {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

class day_Featured extends u_Featured {
    constructor(_index) {
        super(_index)
        // lay out custom aggregation stages here...


        //
    }
}

module.exports = {
    day_Featured,
    day_Limit,
    day_Match,
    day_Project
}