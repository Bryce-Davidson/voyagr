const { 
    v_MatchStage,
    v_ProjectStage
 } = require('./trip-stages');

class v_Pipeline {
    constructor() {
        this.items = [];
    }

    enqueue(stage) {
        var contain = false;
        // for each item in the this.items array
        // compare the (stage.index) to items[i].index
        for (var i = 0; i < this.items.length; i++) {
            // if the .index of the [item] has a higher .index than (stage.index)
            // splice in the (stage) at the items[i]
            if (this.items[i].index >= stage.index) {
                console.warn(`!!!WARNING!!! Atempted to enqueue a stage earlier than a {$text} stage. inserted at index: ${i + 1} instead. Pleade check stage indexes.`)
                // BUT if the item with higher index has attribute this.items[i].$match.$text
                // splice in at i + 1
                // this is to keep the {$text} stage at the front of the queue
                if(this.items[i].$match && this.items[i].$match.$text) {
                    this.items.splice(i + 1, 0, stage);
                    contain = true;
                    break;
                } else {
                    this.items.splice(i, 0, stage);
                    contain = true;
                    break;
                }
            }
        }
        // if the element has the highest index
        // or there are no items in the array yet 
        // it is added at the end of the queue 
        if (!contain) {
            this.items.push(stage);
        }
        return this;
    }
}
