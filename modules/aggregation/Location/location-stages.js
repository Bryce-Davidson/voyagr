const u_Match    = require('../universal-resource-stages/match-stage');
const u_Project  = require('../universal-resource-stages/project-stage');
const u_Limit    = require('../universal-resource-stages/limit-stage');
const u_Featured = require('../universal-resource-stages/featured-stage');
const u_Stage    = require('../universal-resource-stages/parent-stage');

class location_Near extends u_Stage {
    constructor(_index) {
        super(_index);
        this.stage = { $geoNear: {} };
        this.$geoNear = this.stage.$geoNear;
    }
}

class location_Match extends u_Match {
    constructor(_index) {
        super(_index);
    }
}

class location_Project extends u_Project {
    constructor(_index) {
        super(_index);
        // lay out custom aggregation stages here...


        //
    }
}

class location_Limit extends u_Limit {
    constructor(_index, _pagenation) {
        super(_index, _pagenation);
        // lay out custom aggregation stages here...


        //
    }
}

class location_Featured extends u_Featured {
    constructor(_index, _sortDirection) {
        super(_index, _sortDirection);
        // lay out custom aggregation stages here...


        //
    }
}

module.exports = {
    location_Featured,
    location_Limit,
    location_Match,
    location_Project,
    location_Near
}