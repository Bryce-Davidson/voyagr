// lowerr priority = early in list
class Stage {
    constructor(element, priority, type) {
        this.element = element;
        this.priority = priority;
    }
}

class Pipeline {

    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        var stage = new Stage(element, priority);
        var contain = false;

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].priority >= stage.priority) {
                // splice will add the item into the index and push the
                // item at the current index one to the right 0 -> 1
                this.items.splice(i, 0, stage);
                contain = true;
                break;
            }
        }

        if (!contain) {
            this.items.push(stage);
        }
    }

    dequeue() {
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length == 0;
    }

    compile() {
        let stages = [];
        for (var i in this.items) {
            stages.push(this.items[i].element)
        }
        return stages;
    }
} 

var pipeline = new Pipeline(); 

// creating new stage here
pipeline.enqueue({$match: {}}, 0); 
pipeline.enqueue({$project: {}}, 0); 


console.log(pipeline.compile())