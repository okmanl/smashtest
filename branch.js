const Constants = require('./constants.js');

/**
 * Represents a Branch from the test tree
 */
class Branch {
    constructor() {
        this.steps = [];                    // array of Step that are part of this Branch

        /*
        OPTIONAL

        this.nonParallelId = "";            // When multiple branches cannot be run in parallel (due to +), they are each given the same nonParallelId
        this.afterEveryBranch = [];            // Array of Branch, the branches to execute after this branch is done
        this.afterEveryStep = [];               // Array of Branch, the branches to execute after each step in this branch is done
        this.frequency = "";                // Frequency of this Branch (either 'high', 'med', or 'low')
        */
    }

    /**
     * Attaches branch.steps to the end of this.steps
     * Attaches branch.afterEveryBranch to the end of this.afterEveryBranch (so that built-in comes last)
     * Attaches branch.afterEveryStep to the end of this.afterEveryStep (so that built-in comes last)
     * Copies over branch.nonParallelId, if it exists
     */
    mergeToEnd(branch) {
        this.steps = this.steps.concat(branch.steps);

        if(branch.afterEveryBranch) {
            if(!this.afterEveryBranch) {
                this.afterEveryBranch = [];
            }

            this.afterEveryBranch = branch.afterEveryBranch.concat(this.afterEveryBranch);
        }

        if(branch.afterEveryStep) {
            if(!this.afterEveryStep) {
                this.afterEveryStep = [];
            }

            this.afterEveryStep = branch.afterEveryStep.concat(this.afterEveryStep);
        }

        if(branch.nonParallelId) {
            this.nonParallelId = branch.nonParallelId
        }
    }

    /**
     * @return {Branch} Cloned version of this branch
     */
    clone() {
        var clone = new Branch();
        this.steps.forEach(step => {
            clone.steps.push(step.cloneForBranch());
        });

        this.nonParallelId ? clone.nonParallelId = this.nonParallelId : null; // if this.nonParallelId doesn't exist, don't do anything ("null;")

        if(this.afterEveryBranch) {
            this.afterEveryBranch.forEach(branch => {
                if(!clone.afterEveryBranch) {
                    clone.afterEveryBranch = [];
                }
                clone.afterEveryBranch.push(branch.clone());
            });
        }

        if(this.afterEveryStep) {
            this.afterEveryStep.forEach(branch => {
                if(!clone.afterEveryStep) {
                    clone.afterEveryStep = [];
                }
                clone.afterEveryStep.push(branch.clone());
            });
        }

        this.frequency ? clone.frequency = this.frequency : null;

        return clone;
    }

    /**
     * @return {String} The string representation of Branch
     */
    output(branchName) {
        var output = branchName + ' ..\n';

        this.steps.forEach(step => {
            for(var i = 0; i <= step.branchIndents; i++) {
                for (var j = 0; j < Constants.SPACES_PER_INDENT; j++) {
                    output += ' ';
                }
            }

            output += step.text + '\n';
        });

        return output;
    }
}
module.exports = Branch;
