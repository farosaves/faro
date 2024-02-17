type QueueElement = {
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    fnToCall: (...args: any[]) => Promise<any>
    args: any[]
}
type PReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : any;
export type ArgType<T> = T extends (...args: infer R) => any ? R : any;

export default class Semaphore{
    requestQueue: QueueElement[];
    running: boolean;
    
    constructor() {
        this.requestQueue = [];
        this.running = false
    }
    use<F extends (...args: any[]) => Promise<any>>(fnToCall: F, ...args: ArgType<F>): Promise<PReturnType<F>> {
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

// Usage:

// const sleepNprint = async (s: string, n: number) => {
//     await new Promise((r) => setTimeout(r, n))
//     console.log(s)
// }
// (async () => {
//     const sem = new Semaphore()
//     sem.use(async () => sleepNprint("second", 1000))
//     sem.use(async () => console.log("third"))
//     sem.use(async () => console.log("first"))
// })()

// prints 'first', waits 1 second, then 'second', and 'third' immediately after