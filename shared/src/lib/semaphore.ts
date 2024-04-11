type QueueElement = {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  fnToCall: (...args: any[]) => Promise<any>
  args: any[]
}
type PReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : any
type ArgType<T> = T extends (...args: infer R) => any ? R : any

export class Semaphore {
  requestQueue: QueueElement[]
  running: boolean

  constructor() {
    this.requestQueue = []
    this.running = false
  }

  use<F extends (...args: any[]) => Promise<any>>(fnToCall: F, ...args: ArgType<F>): Promise<PReturnType<F>> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        fnToCall,
        args,
      })
      return this.tryNext()
    })
  }

  tryNext() {
    if (!this.requestQueue.length) {
      return
    } else if (!this.running) {
      const { resolve, reject, fnToCall, args } = this.requestQueue.shift()!
      this.running = true
      const req = fnToCall(...args)
      req
        .then((res: any) => resolve(res))
        .catch((err: Error) => reject(err))
        .finally(() => {
          this.running = false
          this.tryNext()
        })
    }
  }
}
