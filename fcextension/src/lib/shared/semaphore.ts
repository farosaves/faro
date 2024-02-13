export default class Semaphore {
    requestQueue: any[];
    running: boolean
    constructor() {
        this.requestQueue = [];
        this.running = false
    }

    /**
     * Returns a Promise that will eventually return the result of the function passed in
     * Use this to limit the number of concurrent function executions
     * @param {*} fnToCall function that has a cap on the number of concurrent executions
     * @param  {...any} args any arguments to be passed to fnToCall
     * @returns Promise that will resolve with the resolved value as if the function passed in was directly called
     */
    callFunction(fnToCall: any, ...args: any) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                resolve,
                reject,
                fnToCall,
                args,
            });
            this.tryNext();
        });
    }

    tryNext() {
        if (!this.requestQueue.length) {
            return;
        } else if (!this.running) {
            let { resolve, reject, fnToCall, args } = this.requestQueue.shift();
            this.running = true;
            let req = fnToCall(...args);
            req.then((res: any) => resolve(res))
                .catch((err: Error) => reject(err))
                .finally(() => {
                    this.running = false;
                    this.tryNext();
                });
        }
    }
}