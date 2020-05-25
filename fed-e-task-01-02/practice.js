const fp = require('lodash/fp')

const cars = [
    {
      name: 'Ferrari FF',
      horsepwser: 660,
      dollar_value: 700000,
      in_stock: true
    },
    {
      name: 'Spyker C12 Zagato',
      horsepwser: 650,
      dollar_value: 648000,
      in_stock: false
    },
    {
      name: 'Jaguar XKR-S',
      horsepwser: 550,
      dollar_value: 132000,
      in_stock: false
    },
    {
      name: 'Audi R8',
      horsepwser: 525,
      dollar_value: 114200,
      in_stock: false
    },
    {
      name: 'Aston Martin One-77',
      horsepwser: 750,
      dollar_value: 1850000,
      in_stock: true
    },
    {
      name: 'Pagani Huayra',
      horsepwser: 700,
      dollar_value: 1300000,
      in_stock: false
    }
  ]

// let isLastInStock = function (cars) {
//   // 获取最后一条数据
//   let last_car = last(cars)
//   console.log(last_car)
//   // 获取最后一条数据的in_stock 属性值
//   return get('in_stock', last_car)
// }

// const isLastInStock = (property) => flowRight(prop(property), last)

const firstName = fp.flowRight(fp.prop('name'), fp.first)(cars)
// console.log(firstName)

// console.log(fp.reduce(fp.add, 0, [2,3,4]))
let _average = function (xs) {
  return fp.reduce(fp.add, 0, xs) / xs.length
}

// let averageDollarValue = function (cars) {
//   let dollar_values = fp.map(function (car) {
//     return car.dollar_value
//   }, cars)
//   return _average(dollar_values)
// }

const averageDollarValue = fp.flowRight(
  _average,
  fp.map((car) => car.dollar_value)
)


const log = x => {
  console.log(2333, x)
  return x
}

const _underscore = fp.replace(/\W+/g, '_')
const transName = (car) =>
  fp.flowRight(
    (name) => {
      car.name = name
      return car
    },
    fp.toLower,
    () => _underscore(car.name)
  )()

const sanitizeNames = fp.map(transName)
// console.log(sanitizeNames(cars))

class Container {
  static of(value) {
    return new Container(value)
  }
  constructor (value) {
    this._value = value
  }
  map(fn) {
    return Container.of(fn(this._value))
  }
}

class Maybe {
  static of (x) {
    return new Maybe(x)
  }
  isNoting () {
    return this._value === void 0 || this._value === null
  }
  constructor (x) {
    this._value = x
  }
  map(fn) {
    return this.isNoting() ? this : Maybe.of(fn(this._value))
  }
}

module.exports = {
  Maybe,
  Container
}

const maybe = Maybe.of([5, 6, 1])
const ex1 = fp.map(fp.add(1))
const maybe2 = maybe.map(ex1)
console.log(maybe2) // Maybe { _value: [6, 7, 2] }

const xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'si', 'do'])
const ex2 = fp.first
const xs1 = xs.map(ex2)
console.log(xs1)

class Monad {
  // 获取函子中的值(可能也是个函子)
  join() {
    return this._value()
  }
  // 压扁嵌套的函子并取到压扁后函子中的值
  flatMap(f) {
    return this.map(f).join()
  }
}
class IO extends Monad {
  static of(v) {
    return new IO(() => v)
  }
  constructor(fn) {
    super()
    this._value = fn
  }
  map(f) {
    return new IO(fp.flowRight(f, this._value))
  }
}

let safeProp = fp.curry(function (x, o) {
  return Maybe.of(o[x])
})
let user = { id: 2, name: 'Albert' }
const ex3 = name => IO.of(user).flatMap(safeProp(name)).map(fp.first)._value
console.log(ex3('name'))
