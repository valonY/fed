# Fed-e-task-01-02

## 概念
### __引用计数的工作原理和优缺点__
  **原理: 统计一个对象的引用数，如果对象的引用数为0，则该可达对象将会被回收。<br>**
  **优点**
  * 可以在程序出现垃圾的时候可以及时回收释放内存
  * 因内存可以不断得到释放而减少了程序暂停的时间<br>
  **<span style="margin-left: -38px">缺点</span>**
  * GC同时也需要维护‘roots’表来统计引用计数，当代码中引用较多时，也会带来损耗
  * 同时对于 对象之间互有引用的情况，即使某个可达对象本身没有被使用，但是引用存在就导致了引用计数不为0，无法被回收的情况。

### __标记整理法工作流程__
**标记整理算法增强了标记清除算法，其在回收对象前会将对象的地址进行移动，使其在地址上连续，然后再回收。以下是流程简图<br>**
  `移动地址前:`
  ![avatar][beforeSettleMemory]
  `移动地址后:`
  ![avatar][afterSettleMemory]

### __V8中新生代存储区垃圾回收流程__
* 活动的对象存储在`From`空间内，当From空间应用到一定大小的时候就会`触发GC操作使用标记整理并整理活动对象的地址，使其连续`然后将活动对象拷贝(`复制算法`)至To，然后From空间进行内存释放。
* 在从`From`到`To`拷贝的过程中有可能出现变量晋升的情况，变量晋升就是新生代的对象移动到老生代。
* 当1. 当一轮GC执行完毕之后还存活的新生代则需要晋升。 2. 当To空间的使用率超过25%的时候，同样需要将此次的活动对象均移动到老生代中。
* 当完成一次GC操作之后，From 和 To需要进行置换。
* 新生代区域，采用复制算法， 因此其每时每刻内部都有空闲空间的存在(为了完成From 到 To的对象复制)，但是新生代区域空间较小(32M)且被一分为二，所以这种空间上的浪费也是比较微不足道的。

### __描述增量标记算法在何时使用及工作原理。__
**`增量标记是对标记清除算法对优化`，让其不会一口气的去寻找到所有活动对象。而是会穿插在程序的运行中执行，降低了程序的卡顿，当标记彻底采集完毕之后，才会把程序停下来，进行垃圾回收。以下是增量标记工作简图**
    **增量标记示意图:**
    ![avatar][increaseTag]

## 实操
### Practice 1

```js
  const fp = require('lodash/fp')
  // horsepower 马力
  // dollar_value 价格
  // in_stock 库存

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
```

#### Q: 使用fp.flowRight重新实现以下函数
```js
  let isLastInStock = function (cars) {
    // 获取最后一条数据
    let last_car = fp.last(cars)
    // 获取最后一条数据的in_stock 属性值
    return fp.prop('in_stock', last_car)
  }
```
#### A:
```js
  const isLastInStock = flowRight(fp.prop('in_stock'), fp.last)

  isLastInStock(cars)

  // 同理， 抽离属性，形成新组合，findLastOfProperty实现如下
  const findLastOfProperty = property => fp.flowRight(fp.prop(property), fp.last)

  findLastOfProperty('in_stock')(cars)
```

#### Q: 使用fp.flowRight, fp.prop. fp.first获取第一个car的name

#### A:
```js
const firstname = fp.flowRight(fp.prop('name'), fp.first)(cars)
```

#### Q: 使用帮助函数_average重构averageDollarValue,使用函数组合方式实现
```js
let _average = function (xs) {
  return fp.reduce(fp.add, 0, xs) / xs.length
}

let averageDollarValue = function (cars) {
  let dollar_values = fp.map(function (car) {
    return car.dollar_value
  }, cars)
  return _average(dollar_values)
}
```

#### A：
```js
const averageDollarValue = fp.flowRight(
  _average,
  fp.map((car) => car.dollar_value)
)
```

#### Q: 使用flowRight 实现sanitizeNames()函数，返回一个下划线连接的小写字符串，将数组中的name转换为这种形式: sanitizeNames(["Hello World"]) => ["hello_world"]
```js
let _underscore = fp.replace(/\W+/g, '_')
```

#### A:
```js
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
```

### Practice 2
```js
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
    return this.isNoting ? this : Maybe.of(fn(this._value))
  }
}

module.exports = {
  Maybe,
  Container
}
```

#### Q: 使用fp.add(x, y)和fp.map(f, x)创建一个可让Functor里的值增加的函数ex1

```js
let maybe = Maybe.of([5, 6, 1])
```
#### A:
```js
const ex1 = fp.map(fp.add(1))
const maybe1 = maybe.map(ex1)
console.log(maybe1) // output: Maybe { _value: [6, 7, 2] }
```

#### Q: 实现一个函数ex2,能够使fp.first获取列表第一个元素
```js
let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'si', 'do'])
```

#### A:
```js
const ex2 = fp.first
const xs1 = xs.map(ex2)
console.log(xs1) // output: Container { _value: 'do' }
```

#### Q: 实现一个函数ex3, 使用safeProp和fp.first找到user的名字的首字母。
```js
let safeProp = fp.curry(function (x, o) {
  return Maybe.of(o[x])
})
let user = { id: 2, name: 'Albert' }
```

#### A:
```js
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

// ex3 函数
const ex3 = name => IO.of(user).flatMap(safeProp(name)).map(fp.first)._value

console.log(ex3('name')) // output: 'A'
```

#### Q: 使用Maybe重写ex4, 不要有if语句。
```js
let ex4 = function (n) {
  if (n) return parseInt(n)
}
```
#### A:
```js
const ex4 = n => Maybe.of(n).map(parseInt)._value
```