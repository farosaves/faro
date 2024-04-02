import * as Rx from "rxjs"
import { observable } from "@trpc/server/observable"

const hasOwnProp = {}.hasOwnProperty

function createName(name: string) {
  return `$ ${name}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TODO = any
export class Emitter<T> {
  subjects: Record<string, Rx.Subject<T>> = {}
  emit = (name: string, data: T) => {
    const fnName = createName(name)
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject())
    this.subjects[fnName].next(data)
  }

  on = (name: string, handler: TODO) => {
    const fnName = createName(name)
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject())
    this.subjects[fnName].subscribe(handler)
  }

  off = (name: string, handler: TODO) => {
    const fnName = createName(name)
    if (this.subjects[fnName]) {
      this.subjects[fnName].unsubscribe()
      delete this.subjects[fnName]
    }
  }

  unsubscribe = () => {
    const subjects = this.subjects
    for (const prop in subjects) {
      if (hasOwnProp.call(subjects, prop)) {
        subjects[prop].unsubscribe()
      }
    }
  }
}

const pushsub = <T>() => {
  const ee = new Emitter<T>()
  const push = (x: T) => ee.emit("bob", x)
  const sub = () => {
    // return an `observable` with a callback which is triggered immediately
    return observable<T>((emit) => {
      const onAdd = emit.next
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("bob", onAdd)
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("bob", onAdd)
      }
    })
  }
  return [push, sub]
}
const [pushAdd, subAdd] = pushsub()
// const appRouter = t.router({
//   add: t.procedure.input(addZ).query(({ input }) => {
//     pushAdd(input)
//     return input[0] + input[1]
//   }),
//   onAdd: t.procedure.subscription(subAdd),
// })
