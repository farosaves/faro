import * as Rx from "rxjs"

const hasOwnProp = {}.hasOwnProperty

function createName(name: string) {
  return `$ ${name}`
}

type TODO = any
export class Emitter<T> {
  subjects: Record<string, Rx.Subject<T>> = {}
  emit = (name: string, data: T) => {
    var fnName = createName(name)
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject())
    this.subjects[fnName].next(data)
  }

  on = (name: string, handler: TODO) => {
    var fnName = createName(name)
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject())
    this.subjects[fnName].subscribe(handler)
  }

  off = (name: string, handler: TODO) => {
    var fnName = createName(name)
    if (this.subjects[fnName]) {
      this.subjects[fnName].unsubscribe()
      delete this.subjects[fnName]
    }
  }

  unsubscribe = () => {
    var subjects = this.subjects
    for (var prop in subjects) {
      if (hasOwnProp.call(subjects, prop)) {
        subjects[prop].unsubscribe()
      }
    }
  }
}
