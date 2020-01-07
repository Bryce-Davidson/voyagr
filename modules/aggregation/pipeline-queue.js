/**
 * Data-Structure: priority-queue 
 * a pipeline structure for inserting into a mongoose API aggregation query
 * @example
 * let pipe = new v_Pipeline(); 
 * let stage = new v_MatchStage().text('Some text for searching');
 * pipe.enqueue(stage);
 * 
 * let pipe_items_array = pipe.items; 
 * console.log(items); // expected output: [{stage}]
 */

class v_Pipeline {
    constructor() { this.items = []; };

    get pipeline() {
        let pipeline = [];
        this.items.forEach(item => {
            if(item.has_field) {
                if (item.stage instanceof Array) {
                    item.stage.forEach(stage => {
                        pipeline.push(stage)
                    })
                } else 
                    pipeline.push(item.stage)
            }
        })
        return pipeline;
    }

    /**
     * to enqueue many items into the pipeline
     * @param {Array} [stages] the stages to enque into the pipeline
     * @example
     * let pipe = new v_Pipeline();
     * 
     * let stage0 = new v_MatchStage().tags('some,tags');
     * let stage1 = new v_ProjectStage().paths('_id');
     * 
     * pipe.enqueue_many(stage0, stage1);
     * console.log(pipe.items); // expected output: [{stage0}, {stage1}]
     * @return {this}
     */

    enqueue_many(stages) {
        if (arguments.length > 1)
            stages = Object.values(arguments);
        for (var i in stages)
            this.enqueue(stages[i]);
        return this;
    }

    /**
     * enqueues a single stage into the pipeline bases on it's internal index/priority property
     * @param {Object} [stage ] a stage to enqueue into the pipeline
     * @example
     * let pipe = new v_Pipeline();
     * let stage = new v_MatchStage().budget(0, 1000);
     * 
     * pipe.enqueue(stage);
     * console.log(pipe.items); // expected output: [{stage}]
     * @return {this}
     */

    enqueue(stage) {
        var contain = false;
        // for each item in the this.items array
        // compare the (stage.index) to items[i].index
        for (var i = 0; i < this.items.length; i++) {
            // splice in the (stage) at the items[i]
            if (this.items[i].index >= stage.index) {
                console.warn(`!!! WARNING !!! Atempted to enqueue a stage earlier than {$text} stage. inserted at index: ${i + 1} instead. Pleade check stage indexes.`);
                // BUT if the item with higher index has attribute this.items[i].$match.$text
                // splice in at i + 1
                // this is to keep the {$text} stage at the front of the queue
                if (this.items[i].$match && this.items[i].$match.$text) {
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

module.exports = v_Pipeline;