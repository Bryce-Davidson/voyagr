class Stages {
    static stage_count = -1;
    constructor(_index) {
        Stages.stage_count++
        this.index = _index || Stages.stage_count;
    }
}

class Match extends Stages{
    constructor(_index) {
        super(_index)
    }
}   

let match = new Match()
console.log(match.index)