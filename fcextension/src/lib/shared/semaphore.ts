type QueueElement<U, T> = {
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
    fnToCall: (...args: U[]) => Promise<T>
    args: U[]
}
export default class Semaphore<U,T>{
    requestQueue: QueueElement<U,T>[];
    running: boolean;
    
    constructor() {
        this.requestQueue = [];
        this.running = false
    }

    callFunction(fnToCall: (...args: U[]) => Promise<T>, ...args: U[]): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                resolve,
                reject,
                fnToCall,
                args,
            });
            return this.tryNext();
        });
    }

    tryNext() {
        if (!this.requestQueue.length) {
            return;
        } else if (!this.running) {
            let { resolve, reject, fnToCall, args } = this.requestQueue.shift()!;
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