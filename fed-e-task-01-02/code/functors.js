const { flowRight } = require('lodash/fp')
const fs = require('fs')

class Monad {
  join() {
    return this._value()
  }
  flatMap(f) {
    return this.map(f).join()
  }
}

class IO extends Monad {
  static of (v) {
    return new IO(() => v)
  }
  constructor(fn) {
    super()
    this._value = fn
  }
  map(f) {
    return new IO(flowRight(f, this._value))
  }
}

const readFile = (path) => new IO(() => fs.readFileSync(path, 'utf-8'))

const res = readFile('proxy.js').join()
console.log(res)
