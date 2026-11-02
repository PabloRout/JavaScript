# JavaScript and Node.js - Complete Notes for Fresher Interviews

## Table of Contents

**Part A: JavaScript**

1. [How JavaScript Works Internally](#1-how-javascript-works-internally)
2. [Execution Context, Hoisting, TDZ](#2-execution-context-hoisting-tdz)
3. [Variables, Data Types, Coercion](#3-variables-data-types-coercion)
4. [Scope](#4-scope)
5. [Closures](#5-closures)
6. [this Keyword](#6-this-keyword)
7. [call, apply, bind](#7-call-apply-bind)
8. [Functions In Depth](#8-functions-in-depth)
9. [OOP and Prototypes](#9-oop-and-prototypes)
10. [Event Loop, Call Stack, Microtasks](#10-event-loop-call-stack-microtasks)
11. [Asynchronous JS: Callbacks, Promises, async/await](#11-asynchronous-js)
12. [Fetch API](#12-fetch-api)
13. [Modern JS (ES6+)](#13-modern-js-es6)
14. [Array Methods](#14-array-methods)
15. [DOM and Events](#15-dom-and-events)
16. [Memory Management](#16-memory-management)

**Part B: Node.js**

17. [Node.js Basics and Architecture](#17-nodejs-basics-and-architecture)
18. [Node.js Event Loop (libuv)](#18-nodejs-event-loop-libuv)
19. [Modules, npm, package.json](#19-modules-npm-packagejson)
20. [Core Modules](#20-core-modules)
21. [Streams and Buffers](#21-streams-and-buffers)
22. [Express.js and Middleware](#22-expressjs-and-middleware)
23. [Auth, Security, Error Handling](#23-auth-security-error-handling)
24. [Scaling Node.js](#24-scaling-nodejs)

**Part C: Interview Prep**

25. [Buzzwords Glossary](#25-buzzwords-glossary)
26. [Interview Questions and Answers](#26-interview-questions-and-answers)
27. [Coding Practice Questions](#27-coding-practice-questions)

---

# PART A: JAVASCRIPT

## 1. How JavaScript Works Internally

### What is JavaScript?

- High-level, **interpreted/JIT-compiled**, **dynamically typed**, **single-threaded**, multi-paradigm language (OOP, functional, event-driven).
- Runs in the browser (Chrome, Firefox...) and outside it (Node.js, Deno, Bun).

### JavaScript Engine

A program that reads and runs your JS code. Chrome and Node.js use **V8**, Firefox uses **SpiderMonkey**, Safari uses **JavaScriptCore**.

Inside V8:

1. **Parser** reads code and builds an **AST** (Abstract Syntax Tree).
2. **Ignition** (interpreter) converts the AST to bytecode and runs it.
3. **TurboFan** (optimizing compiler) finds "hot" code (run many times) and compiles it to fast machine code. This is **JIT (Just-In-Time) compilation**.
4. If assumptions break (for example a variable suddenly changes type), it **deoptimizes** back to bytecode.
5. **Garbage Collector** frees unused memory.

The engine has two main parts: **Memory Heap** (where objects live) and **Call Stack** (where function calls are tracked).

### Why "single-threaded"?

JS has **one call stack**, so it runs **one piece of code at a time**. Slow work (timers, network, files) is **not done by the JS engine itself**. It is handed to the environment (browser Web APIs / Node's libuv), and the result comes back through the **event loop**. This is what makes JS *non-blocking* even though it is single-threaded (see section 10).

### Runtime = Engine + extras

| Part | Browser | Node.js |
| --- | --- | --- |
| Engine | V8 | V8 |
| Async APIs | Web APIs (DOM, fetch, setTimeout) | libuv + C++ bindings (fs, net, timers) |
| Global object | `window` | `global` (and `globalThis` everywhere) |
| Event loop | Browser's | libuv's |

---

## 2. Execution Context, Hoisting, TDZ

### Execution Context (EC)

The environment where JS code is evaluated. Types:

1. **Global EC** - created first, `this` = `window` (browser) / `module.exports` (Node file).
2. **Function EC** - created every time a function is **called**.
3. (eval EC - ignore)

Each EC is created in **two phases**:

1. **Creation (memory) phase**: memory is allocated for variables and functions. `var` -> `undefined`, function declarations -> the whole function, `let/const` -> uninitialized (TDZ). `this` is decided and the scope chain is set up.
2. **Execution phase**: code runs line by line and values are assigned.

### Call Stack

A stack (LIFO) that tracks execution contexts. Calling a function **pushes** a new EC, returning **pops** it. Too many nested calls (e.g. infinite recursion) gives **Stack Overflow** (`RangeError: Maximum call stack size exceeded`).

```javascript
function one() { two(); }
function two() { three(); }
function three() { console.log("done"); }
one();
// stack: [global] -> [global, one] -> [global, one, two] -> [global, one, two, three] -> pops back
```

### Hoisting

Declarations are "moved to the top" of their scope during the creation phase (they are not physically moved).

```javascript
console.log(a); // undefined (var is hoisted and initialized with undefined)
var a = 10;

sayHi();        // works: function declarations are fully hoisted
function sayHi() { console.log("hi"); }

hello();        // TypeError: hello is not a function (var hoisted as undefined)
var hello = function () {};

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 5;
```

| Declaration | Hoisted? | Initial value |
| --- | --- | --- |
| `var` | Yes | `undefined` |
| `let` / `const` | Yes, but in **TDZ** | uninitialized |
| function declaration | Yes | the function itself |
| function expression / arrow | Only the variable name (per `var`/`let`/`const` rules) | depends |
| `class` | Yes, but in TDZ | uninitialized |

### Temporal Dead Zone (TDZ)

The time between entering a scope and the line where a `let`/`const`/`class` is declared. Accessing it throws `ReferenceError`.

---

## 3. Variables, Data Types, Coercion

### var vs let vs const

| | `var` | `let` | `const` |
| --- | --- | --- | --- |
| Scope | function | block | block |
| Re-declare | yes | no | no |
| Re-assign | yes | yes | no |
| Hoisting | `undefined` | TDZ | TDZ |
| Attached to `window` | yes (global) | no | no |

`const` prevents **re-assignment**, not mutation: `const arr = []; arr.push(1)` is fine.

```javascript
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3 (one shared i)
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2 (new i per iteration)
```

### Data types

**Primitives** (immutable, stored by value): `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`.
**Non-primitive** (stored by reference): `object` (arrays, functions, dates, maps, sets are all objects).

```javascript
typeof null;        // "object" (a famous old bug)
typeof undefined;   // "undefined"
typeof [];          // "object"  -> use Array.isArray([])
typeof function(){} // "function"
typeof NaN;         // "number"
```

- `undefined` = declared but no value. `null` = intentionally empty.
- `NaN !== NaN`. Use `Number.isNaN(x)`.

### Pass by value vs reference

```javascript
let a = 10; let b = a; b = 20;       // a is still 10 (copy of value)

let o1 = { x: 1 }; let o2 = o1; o2.x = 99;
console.log(o1.x); // 99 (both point to the same object)
```

### Shallow vs deep copy

```javascript
const copy1 = { ...obj };               // shallow (nested objects still shared)
const copy2 = Object.assign({}, obj);   // shallow
const copy3 = JSON.parse(JSON.stringify(obj)); // deep, but loses functions, undefined, Date, Map, Set
const copy4 = structuredClone(obj);     // deep, modern, handles Date/Map/Set (not functions)
```

### == vs ===

- `==` converts types first (loose). `===` compares type **and** value (strict). Prefer `===`.

```javascript
0 == "0";        // true
0 == false;      // true
null == undefined; // true
null === undefined; // false
[] == false;     // true
NaN == NaN;      // false
```

### Truthy and falsy

**Falsy values (only 8):** `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy (including `"0"`, `[]`, `{}`).

### Type coercion tricks

```javascript
"5" + 2;   // "52" (+ with a string concatenates)
"5" - 2;   // 3    (- converts to number)
true + 1;  // 2
[] + [];   // ""
[] + {};   // "[object Object]"
```

### Useful operators

```javascript
a ?? b;        // nullish: b only if a is null/undefined (0 and "" are kept)
a || b;        // b if a is any falsy value
obj?.user?.name; // optional chaining: undefined instead of an error
a ||= 5; a &&= 5; a ??= 5; // logical assignment
```

---

## 4. Scope

Scope decides **where a variable can be accessed**.

- **Global scope**: accessible everywhere.
- **Function scope**: variables declared inside a function (`var`, `let`, `const`) live only in it.
- **Block scope**: `let`/`const` inside `{ }` live only in that block (`var` ignores blocks).
- **Scope chain**: if a variable isn't found in the current scope, JS looks in the outer scope, then the next, up to global. If never found: `ReferenceError`.

### Lexical scope

JS uses **lexical (static) scope**: a function's scope is decided by **where it is written** in the code, not where it is called.

```javascript
function abcd() {
  // a is lexically scoped to abcd()
  let a = 12;
  function defg() {
    console.log(a); // defg can see a because it is written inside abcd
  }
  defg();
}
abcd(); // 12
```

### Dynamic scope (JS does NOT work like this)

In a dynamically scoped language, a variable would be looked up where the function is **called**. Check what JS prints here:

```javascript
let a = 12;
function abcd() {
  console.log(a);
}

function defg() {
  let a = 13;
  abcd();
}
defg(); // prints 12, NOT 13
```

`abcd` was **written** in the global scope, so it uses the global `a = 12`. If JS were dynamically scoped, it would print 13 (because `abcd` is called inside `defg`). Languages like Bash and old Lisp use dynamic scope. JS only has dynamic behavior for `this`.

---

## 5. Closures

**Definition:** a closure is a function **bundled together with its lexical environment**. An inner function can **remember and access the variables of its outer function even after the outer function has finished executing**.

```javascript
function abcd() {
  let a = 12;
  return function () {
    console.log(a);
  };
}

abcd()();       // 12
let f = abcd();
f();            // 12
```

### How is the variable preserved?

Normally, when a function ends, its variables are removed from memory. With a closure, the inner function keeps a hidden link (`[[Environment]]`) to the **lexical environment** where it was created. As long as the inner function is reachable, that environment (and the variables it uses) is **not garbage collected**. (Technically, V8 keeps only the variables the inner function actually uses.)

> Note: a closure doesn't need to be *returned*. Any function that uses an outer variable and is used later (callback, event handler, timer) forms a closure.

### Uses

1. **Data privacy / private variables**

```javascript
function createCounter() {
  let count = 0; // not accessible from outside
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}
const c = createCounter();
c.increment(); c.increment();
console.log(c.getCount()); // 2
console.log(c.count);      // undefined
```

2. **Avoid global pollution** (module pattern, IIFE)

```javascript
const app = (function () {
  let secret = "hidden";
  return { reveal: () => secret };
})();
```

3. **Function factories / currying**

```javascript
const multiplyBy = (n) => (x) => x * n;
const double = multiplyBy(2);
double(5); // 10
```

4. **Memoization, once(), debounce, throttle**, event handlers, callbacks, React hooks (`useState` relies on closures).

### Classic closure + loop problem

```javascript
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), i * 1000); // 4 4 4
}
// Fix 1: use let (new binding per iteration)
// Fix 2: IIFE
for (var i = 1; i <= 3; i++) {
  ((j) => setTimeout(() => console.log(j), j * 1000))(i); // 1 2 3
}
```

### Drawbacks

Can cause **memory leaks** if large data is kept alive unnecessarily (e.g. forgotten event listeners, big arrays referenced by a long-lived closure).

---

## 6. this Keyword

`this` refers to **the object that is executing the current code**. For normal functions it is decided by **how the function is called** (not where it is written). Arrow functions are the exception: they take `this` from the surrounding (lexical) scope.

### this in different places

| Where | `this` value |
| --- | --- |
| Global scope | `window` (browser) / `{}` module.exports in a Node file |
| Normal function (non-strict) | `window` (`global` in Node) |
| Normal function (strict mode) | `undefined` |
| Object method (regular function) | the object before the dot |
| Object method (arrow function) | `window` (outer `this`, not the object) |
| Regular function inside a regular method | `window` / `undefined` (this is lost) |
| Arrow function inside a regular method | the object (inherits from the method) |
| Event handler (regular function) | the element that received the event |
| Event handler (arrow function) | `window` (outer `this`) |
| Constructor with `new` | the new object being created |
| Class | the instance (the object created by `new`) |
| `call` / `apply` / `bind` | whatever you pass |

### Object method

```javascript
let obj = {
  name: "gyana",
  age: 22,
  sayAge: function () {
    console.log(this.age); // 22 (this = obj)
  },
  arrowAge: () => {
    console.log(this.age); // undefined (this = window, not obj)
  },
};

obj.sayAge();
obj.arrowAge();
```

### Lost `this`

```javascript
const say = obj.sayAge;
say(); // undefined (called with no object, this = window/undefined)
```

### Inside nested functions

```javascript
let user = {
  name: "gyana",
  regular() {
    function inner() { console.log(this); } // window / undefined
    inner();
  },
  arrow() {
    const inner = () => console.log(this); // user
    inner();
  },
};
```

### DOM event handlers

```javascript
document.querySelector("h1").addEventListener("click", function () {
  console.log(this); // the h1 element
});

document.querySelector("h1").addEventListener("click", () => {
  console.log(this); // window (arrow function does not get its own this)
});
```

### Classes

```javascript
class MyClass {
  constructor() {
    console.log("heyhey");
    this.a = 12; // this = the new instance
  }
}

let val = new MyClass();
console.log(val); // MyClass { a: 12 }
```

Inside a constructor/class, `this` starts as an **empty object** and gets properties as you assign them.

### Quick revision

```text
global                                   -> window
normal function                          -> window (undefined in strict mode)
method with ES5 function                 -> the object
method with ES6 arrow function           -> window
ES5 function inside ES5 method           -> window
arrow function inside ES5 method         -> the object
event handler (ES5 function)             -> the element
event handler (arrow function)           -> window
class / constructor                      -> the new instance
```

---

## 7. call, apply, bind

They let us **manually set `this`** when calling a function.

| | `call` | `apply` | `bind` |
| --- | --- | --- | --- |
| Runs the function immediately | Yes | Yes | **No**, returns a new function |
| Arguments | one by one | **as an array** | one by one (can be partial) |

```javascript
let obj = { name: "gyaneswar", age: 22 };

function abcd(a, b, c) {
  console.log(this, a, b, c);
}

abcd.call(obj, 1, 2, 3);     // arguments passed individually
abcd.apply(obj, [1, 2, 3]);  // arguments passed as ONE array (any number of values)

let fun = abcd.bind(obj, 1, 2, 3); // returns a new function with this and args fixed
fun();
```

> Correction to a common belief: `apply` is not limited to two parameters. It takes **two arguments** (`this` and an array), but the array can hold any number of values.

### Real uses

```javascript
Math.max.apply(null, [4, 9, 2]);      // 9 (modern: Math.max(...arr))
const bound = obj.method.bind(obj);   // keep `this` when passing a method as a callback
Array.prototype.slice.call(arguments); // convert array-like to array
```

**Partial application with bind:**

```javascript
function add(a, b) { return a + b; }
const add5 = add.bind(null, 5);
add5(10); // 15
```

A bound function cannot have its `this` changed again by `call`/`apply`/`bind`.

---

## 8. Functions In Depth

### Ways to write a function

```javascript
function add(a, b) { return a + b; }          // declaration (hoisted)
const add2 = function (a, b) { return a + b; }; // expression (not hoisted)
const add3 = (a, b) => a + b;                  // arrow function
```

### Arrow functions vs normal functions

| Arrow | Normal |
| --- | --- |
| No own `this` (uses outer) | Own `this` |
| No `arguments` object | Has `arguments` |
| Cannot be used with `new` | Can be a constructor |
| No `prototype` | Has `prototype` |
| Short syntax, implicit return | Verbose |

### First-class functions

Functions are **values**: they can be stored in variables, passed as arguments, and returned from functions.

### Higher-Order Function (HOF)

A function that **takes a function as an argument or returns a function**. Examples: `map`, `filter`, `reduce`, `setTimeout`, `addEventListener`.

### Callback

A function passed to another function to be called later.

### IIFE (Immediately Invoked Function Expression)

```javascript
(function () {
  console.log("runs immediately");
})();
```

Used to create a private scope.

### Rest, spread, default params

```javascript
function sum(...nums) { return nums.reduce((a, b) => a + b, 0); } // rest: collects
const arr2 = [...arr1, 4, 5];                                      // spread: expands
function greet(name = "Guest") {}                                  // default parameter
```

### Currying

Transforming `f(a, b, c)` into `f(a)(b)(c)`.

```javascript
const curry = (a) => (b) => (c) => a + b + c;
curry(1)(2)(3); // 6
```

### Pure function

Same input -> same output, no side effects (doesn't change external state). Easier to test and predict.

### Memoization

Cache results of expensive calls.

```javascript
function memoize(fn) {
  const cache = {};
  return function (...args) {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    return (cache[key] = fn.apply(this, args));
  };
}
```

### Generators and iterators (know the idea)

```javascript
function* gen() {
  yield 1;
  yield 2;
}
const it = gen();
it.next(); // { value: 1, done: false }
```

A generator function can **pause** at `yield` and resume later.

---

## 9. OOP and Prototypes

### Four pillars of OOP

1. **Encapsulation**: bundle data and methods, hide internals (closures, `#private`).
2. **Abstraction**: expose only what is needed.
3. **Inheritance**: one class/object reuses another's properties.
4. **Polymorphism**: same method name, different behavior (method overriding).

### Create objects using a constructor function

```javascript
function CreatePencil(name, price, color, company) {
  this.name = name;
  this.price = price;
  this.color = color;
  this.company = company;
}

let pencil1 = new CreatePencil("Natraj", 10, "black", "nataraj");
console.log(pencil1);
```

**What `new` does (4 steps):**

1. Creates a new empty object `{}`.
2. Links its `__proto__` to `Constructor.prototype`.
3. Runs the constructor with `this` = the new object.
4. Returns the object (unless the constructor returns another object).

### Prototype

Every function has a `prototype` object, and every object has a hidden link `__proto__` ([[Prototype]]) to another object. Properties placed on the prototype are **shared by all instances** (saving memory, because it isn't copied into each object). (It's shared, but it is not the same as a `static` member, which belongs to the class itself.)

```javascript
function CreatePencil(name, price, color) {
  this.name = name;
  this.price = price;
  this.color = color;
}

CreatePencil.prototype.company = "Dome";
CreatePencil.prototype.write = function () { console.log(this.name + " writes"); };

const p1 = new CreatePencil("A", 5, "red");
const p2 = new CreatePencil("B", 7, "blue");
p1.company; // "Dome" (found on the prototype)
p1.write === p2.write; // true (same shared function)
```

### Prototype chain

When you access a property, JS looks on the object itself -> then `__proto__` -> then that object's `__proto__` ... until `null`. This is how inheritance works and how arrays get `.map()` (from `Array.prototype`).

```text
pencil1 -> CreatePencil.prototype -> Object.prototype -> null
```

`obj.hasOwnProperty("x")` / `Object.hasOwn(obj, "x")` checks only the object itself.

### Class (syntactic sugar over prototypes)

```javascript
class CreatePencil {
  constructor(name, company, price, color) {
    this.name = name;
    this.company = company;
    this.price = price;
    this.color = color;
  }

  write(text) {                      // goes on CreatePencil.prototype (shared)
    let h1 = document.createElement("h1");
    h1.textContent = text;
    h1.style.color = this.color;
    document.body.appendChild(h1);
  }
}
```

Class features:

```javascript
class Account {
  #balance = 0;               // private field
  static bank = "ABC";        // static: belongs to the class
  constructor(owner) { this.owner = owner; }

  get balance() { return this.#balance; }        // getter
  set balance(v) { if (v >= 0) this.#balance = v; } // setter
  deposit(x) { this.#balance += x; return this; }
  static info() { return Account.bank; }
}
```

Classes are not hoisted like functions (TDZ) and run in strict mode.

### extends and super (classical inheritance: class -> class)

```javascript
class User {
  constructor(name, address, username, email) {
    this.name = name;
    this.address = address;
    this.username = username;
    this.email = email;
    this.role = "user";
  }

  write(text) {
    let h1 = document.createElement("h1");
    h1.textContent = `${this.name} : ${text}`;
    document.body.appendChild(h1);
  }
}

class Admin extends User {
  constructor(name, address, username, email) {
    super(name, address, username, email); // must be called before using `this`
    this.role = "admin";
  }

  remove() {
    document.querySelectorAll("h1").forEach((e) => e.remove());
  }
}
```

- `super(...)` calls the parent constructor. It must run before `this` is used in a child constructor.
- `super.method()` calls the parent's method (useful for overriding = polymorphism).

### Prototypal inheritance (object -> object)

```javascript
let coffee = {
  color: "dark",
  drink: function () {
    console.log("good good good");
  },
};

let arabiataCoffee = Object.create(coffee); // new object whose prototype is coffee
arabiataCoffee.taste = "bitter";
arabiataCoffee.drink();     // found through the prototype chain
console.log(arabiataCoffee); // { taste: "bitter" }  (color and drink live on the prototype)
```

### Classical vs prototypal (summary)

| Classical (`class extends`) | Prototypal (`Object.create`) |
| --- | --- |
| Class -> class | Object -> object |
| Looks like Java/C++ | Native JS style |
| Under the hood it also uses prototypes | Direct prototype link |

### Other object tools

```javascript
Object.keys(o); Object.values(o); Object.entries(o);
Object.freeze(o);   // can't add/change/remove (shallow)
Object.seal(o);     // can change existing values, can't add/remove
Object.assign(target, src);
Object.fromEntries(entries);
```

---

## 10. Event Loop, Call Stack, Microtasks

This is the **most asked** JS interview topic. Learn it well.

### The problem

JS is single-threaded: one call stack, one thing at a time. If a slow task (network call, timer, file read) ran on the stack, the page would freeze. So JS uses the **runtime environment** to do slow work in the background.

### The pieces

```text
        +--------------------+        +----------------------------+
        |   JS ENGINE (V8)   |        |   BROWSER / NODE RUNTIME   |
        |  +--------------+  |        |  Web APIs / libuv          |
        |  | Memory Heap  |  | -----> |  - setTimeout, setInterval |
        |  +--------------+  |        |  - fetch / XHR             |
        |  | Call Stack   |  |        |  - DOM events              |
        |  +--------------+  |        |  - fs, network (Node)      |
        +---------^----------+        +-------------+--------------+
                  |                                 |
                  |  Event Loop                     v
                  |                    +------------------------+
                  +<-------------------| Microtask Queue        | (high priority)
                  +<-------------------| Macrotask (Callback) Q | (low priority)
                                       +------------------------+
```

1. **Call Stack**: where your synchronous code runs.
2. **Web APIs (browser) / libuv (Node)**: do the waiting/async work **outside** the JS thread. This is where "multithreading" actually happens: the *runtime* uses other threads, but your JS code still runs on one.
3. **Macrotask queue (callback / task queue)**: `setTimeout`, `setInterval`, `setImmediate` (Node), DOM events, I/O callbacks, `MessageChannel`.
4. **Microtask queue**: `Promise.then/catch/finally`, `async/await` continuations, `queueMicrotask`, `MutationObserver`. (Node also has `process.nextTick`.)
5. **Event Loop**: a constant loop that checks: *"Is the call stack empty?"* If yes, it moves the next waiting callback onto the stack.

### The order of execution

1. Run all **synchronous** code (call stack).
2. When the stack is empty, run **ALL microtasks** (until the microtask queue is completely empty, including new ones added meanwhile).
3. Run **ONE macrotask**.
4. Run all microtasks again.
5. (Browser may render/paint) -> repeat from step 3.

> **Rule: sync -> microtasks -> one macrotask -> microtasks -> next macrotask ...**

### Example 1

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// Output: 1 4 3 2
```

Why: `1` and `4` are sync. The promise callback is a microtask (runs first). The timer callback is a macrotask (runs after) even with a delay of 0.

### Example 2 (harder)

```javascript
console.log("start");

setTimeout(() => console.log("timeout"), 0);

Promise.resolve()
  .then(() => {
    console.log("promise 1");
    setTimeout(() => console.log("timeout inside promise"), 0);
  })
  .then(() => console.log("promise 2"));

(async () => {
  console.log("async start");
  await null;
  console.log("after await");
})();

console.log("end");

// start, async start, end, promise 1, after await, promise 2, timeout, timeout inside promise
```

Notes: code before the first `await` runs synchronously. Everything after `await` becomes a microtask.

### async/await and the event loop

`await x` pauses **only that async function**, not the whole program. The rest of the function becomes a microtask that runs when `x` settles. Other code keeps running.

### Does setTimeout(fn, 1000) run exactly after 1 second?

No. 1000 ms is the **minimum** delay. The callback goes to the queue after 1 second and runs only when the call stack is empty. If the stack is busy, it waits longer.

### Blocking the event loop

```javascript
setTimeout(() => console.log("timer"), 0);
const end = Date.now() + 3000;
while (Date.now() < end) {} // blocks everything for 3 seconds
console.log("done");        // timer only fires after this
```

Heavy synchronous loops freeze the UI/server. Fix: break work into chunks, use Web Workers (browser), `worker_threads` (Node), or move work elsewhere.

### Microtask starvation

A microtask that keeps adding microtasks forever means macrotasks (and rendering) never run.

### Is JS really "single-threaded"? What about multithreading?

- Your **JS code** runs on **one thread** (one call stack).
- The **browser/Node runtime is multi-threaded** underneath (network thread, timer thread, file I/O thread pool, rendering thread).
- For real parallel JS you use **Web Workers** (browser) or **`worker_threads`** (Node). Workers have their **own** stack, heap and event loop and talk via `postMessage` (no shared variables, except `SharedArrayBuffer`).

### Concurrency vs Parallelism

- **Concurrency**: many tasks in progress, interleaved (JS event loop).
- **Parallelism**: tasks literally running at the same time on multiple cores (Workers, multiple processes).

### Browser rendering and the loop

Between macrotasks the browser may repaint. `requestAnimationFrame` callbacks run **before the next paint**. Long tasks (>50 ms) make the UI feel janky.

---

## 11. Asynchronous JS

- **Synchronous**: code runs line by line; each line **waits** for the previous one to finish (blocking).
- **Asynchronous**: long operations start, and the program **does not wait**; it continues, and gets the result later (non-blocking).

### Callback pattern and callback hell

A function passed to another function to be called later is a **callback**.

```javascript
function profileLekarAao(username, cb) {
  console.log("fetching profile data.....");
  setTimeout(() => {
    console.log(`profile fetched ${username}`);
    cb({ _id: 1, username });
  }, 2000);
}

function saarePostLekarAao(id, cb) {
  console.log("fetching complete profile data.....");
  setTimeout(() => {
    cb({ _id: id, posts: ["hey", "hello", "good morning!"] });
  }, 3000);
}

function savedPostsNikalo(id, cb) {
  console.log("fetching saved posts");
  setTimeout(() => {
    cb({ _id: id, saved: [1, 2, 4, 5] });
  }, 3000);
}

profileLekarAao("gyaneswar", function (data) {
  console.log(data);
  saarePostLekarAao(data._id, function (posts) {
    console.log(posts);
    savedPostsNikalo(data._id, function (saved) {
      console.log(saved);
    });
  });
});
```

**Callback hell** (pyramid of doom): deeply nested callbacks. Problems: hard to read, hard to handle errors, hard to maintain, and **inversion of control** (you trust another function to call your callback correctly and only once).

Note the error-first convention in Node: `callback(err, data)`.

### Promises

An object representing the **eventual result** of an async operation. A promise has **three states**:

1. **pending** (initial)
2. **fulfilled** (resolved with a value)
3. **rejected** (failed with an error)

Once settled (fulfilled or rejected) it **never changes again**. We write code for both outcomes.

```javascript
let pr = new Promise((res, rej) => {
  setTimeout(() => {
    let rn = Math.floor(Math.random() * 10);
    rn > 5 ? res(`Resolved ${rn}`) : rej(`Rejected ${rn}`);
  }, 3000);
});

pr.then((val) => {
  console.log(val);
})
  .catch((err) => {
    console.error(err);
  })
  .finally(() => console.log("always runs"));
```

**Chaining:** `.then()` returns a **new promise**, so you can flatten the callback hell. Returning a value passes it to the next `.then`; returning a promise waits for it. One `.catch()` at the end handles errors from any step.

```javascript
getProfile("gyaneswar")
  .then((p) => getPosts(p._id))
  .then((posts) => getSaved(posts._id))
  .then(console.log)
  .catch(console.error);
```

### Promise combinators

| Method | Behavior |
| --- | --- |
| `Promise.all([..])` | Resolves with all results; **rejects immediately** if any one rejects |
| `Promise.allSettled([..])` | Waits for all, never rejects; gives `{status, value/reason}` for each |
| `Promise.race([..])` | Settles with the **first** one to settle (success or failure) |
| `Promise.any([..])` | Resolves with the **first fulfilled**; rejects only if all reject (AggregateError) |
| `Promise.resolve(x)` / `Promise.reject(e)` | Create already-settled promises |

### async & await

Syntactic sugar over promises that makes async code look synchronous.

- `async` function **always returns a promise**.
- `await` pauses the async function until the promise settles, then gives the value (or throws).
- `await` works only inside `async` functions (or top-level in ES modules).

```javascript
let pr = new Promise((res, rej) => {
  setTimeout(() => {
    let rn = Math.floor(Math.random() * 10);
    rn > 5 ? res(`Resolved ${rn}`) : rej(`Rejected ${rn}`);
  }, 3000);
});

async function abcd() {
  try {
    let val = await pr;
    console.log(val);
  } catch (err) {
    console.error(err);
  }
}

abcd();
```

### Sequential vs parallel (very common interview point)

```javascript
// Sequential: total time = a + b (slow)
const a = await getA();
const b = await getB();

// Parallel: total time = max(a, b) (fast)
const [a2, b2] = await Promise.all([getA(), getB()]);
```

Mistake: `await` inside `forEach` does not work as expected (forEach doesn't wait). Use `for...of` (sequential) or `Promise.all(arr.map(...))` (parallel).

### Error handling

- Promises: `.catch()`. async/await: `try/catch`.
- An **unhandled rejection** crashes modern Node (`unhandledRejection`) or logs a warning in browsers.
- `throw` inside `.then` becomes a rejection.

### Promisify and a delay helper

```javascript
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await sleep(1000);
```

---

## 12. Fetch API

`fetch(url, options)` returns a **promise** that resolves to a `Response` object.

```javascript
fetch("https://randomuser.me/api/")
  .then((rawData) => rawData.json())   // .json() also returns a promise
  .then((data) => {
    console.log(data.results[0].name);
  })
  .catch((err) => {
    console.error(err);
  });
```

### Important: fetch does NOT reject on HTTP errors

`fetch` rejects only on **network failure**. A 404 or 500 is still a *resolved* promise. Always check `response.ok`.

```javascript
async function getUser() {
  try {
    const res = await fetch("https://randomuser.me/api/");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.results[0];
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
```

### POST request

```javascript
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "gyaneswar" }),
});
```

### Cancel a request with AbortController

```javascript
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort(); // rejects with AbortError
```

### Other related

- **JSON**: `JSON.stringify(obj)` (object -> string), `JSON.parse(str)` (string -> object).
- **XMLHttpRequest**: the older API; **Axios**: popular library (auto JSON, rejects on HTTP errors, interceptors).
- **CORS**: browser security rule that blocks requests to a different origin unless the server allows it with headers (`Access-Control-Allow-Origin`). It is enforced by the **browser**, not the server.

---

## 13. Modern JS (ES6+)

```javascript
// Destructuring
const { name, age = 18, ...rest } = user;
const [first, , third] = arr;

// Template literals
`Hello ${name}, you are ${age}`;

// Spread / Rest
const merged = { ...a, ...b };

// Shorthand properties and computed keys
const obj = { name, [`key_${id}`]: 1, greet() {} };

// Optional chaining and nullish coalescing
user?.address?.city ?? "unknown";

// Modules
export const x = 1;           export default fn;
import fn, { x } from "./file.js";

// Map and Set
const m = new Map([["a", 1]]);   // any type as key, keeps insertion order
const s = new Set([1, 1, 2]);    // unique values -> {1, 2}
const uniq = [...new Set(arr)];

// Symbol, BigInt, for...of, for...in
for (const v of arr) {}        // values of iterables
for (const k in obj) {}        // keys of an object (including inherited enumerable)

// WeakMap / WeakSet: keys are weakly held (garbage collected) and only objects
// Array helpers: at(), flat(), flatMap(), Object.groupBy (newer)
```

**Map vs Object:** Map keeps insertion order, accepts any key type, has `.size`, and is better for frequent add/remove.

**Event delegation, currying, etc.** are covered in other sections.

### Modules: ESM vs CommonJS

| ESM | CommonJS |
| --- | --- |
| `import` / `export` | `require()` / `module.exports` |
| Static, async loading | Dynamic, synchronous |
| Works in browsers and Node (`"type": "module"`) | Node's original system |
| Supports tree shaking, top-level await | No |

### Strict mode

`"use strict";` turns silent mistakes into errors (undeclared variables, duplicate params, `this` = `undefined` in functions). Modules and classes are strict automatically.

---

## 14. Array Methods

```javascript
const nums = [1, 2, 3, 4, 5];

nums.map((n) => n * 2);               // [2,4,6,8,10]  returns NEW array, same length
nums.filter((n) => n % 2 === 0);      // [2,4]         NEW array of items that pass
nums.reduce((acc, n) => acc + n, 0);  // 15            reduces to a single value
nums.find((n) => n > 3);              // 4             first match (or undefined)
nums.findIndex((n) => n > 3);         // 3
nums.some((n) => n > 4);              // true
nums.every((n) => n > 0);             // true
nums.includes(3);                     // true
nums.forEach((n) => console.log(n));  // no return value, can't break
nums.sort((a, b) => a - b);           // sorts IN PLACE (default sort is string-based!)
nums.slice(1, 3);                     // [2,3]    copy, does NOT change original
nums.splice(1, 2);                    // removes 2 items from index 1, CHANGES original
nums.concat([6]); nums.join("-"); nums.reverse(); nums.flat(); Array.from("abc");
```

| Mutates the original | Doesn't mutate |
| --- | --- |
| `push, pop, shift, unshift, splice, sort, reverse, fill` | `map, filter, slice, concat, reduce, find, flat, toSorted, toReversed` |

`[10, 9, 1].sort()` gives `[1, 10, 9]` because it compares as strings. Always pass a compare function for numbers.

---

## 15. DOM and Events

```javascript
document.getElementById("id");
document.querySelector(".class");       // first match
document.querySelectorAll("li");        // NodeList (all matches)
el.textContent = "hi";  el.innerHTML = "<b>hi</b>";  // innerHTML can cause XSS
el.classList.add("active"); el.classList.toggle("dark");
el.setAttribute("src", "a.png");
document.createElement("div"); parent.appendChild(child); el.remove();
el.addEventListener("click", handler);
```

### Event bubbling and capturing

When an event fires on an element:

1. **Capturing phase**: from `window` down to the target.
2. **Target phase**.
3. **Bubbling phase** (default): from the target **up** to `window`.

`e.stopPropagation()` stops it going further. `e.preventDefault()` stops the default action (link navigation, form submit). `e.target` = element that triggered the event, `e.currentTarget` = element the listener is attached to.

### Event delegation

Attach **one** listener to the parent and use `e.target` to find the child. Efficient (fewer listeners) and works for elements added later.

```javascript
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") console.log(e.target.textContent);
});
```

### Debounce and throttle

- **Debounce**: run the function only after the user **stops** triggering it for N ms (search box).
- **Throttle**: run the function **at most once per N ms** (scroll, resize).

### Web storage

| | localStorage | sessionStorage | Cookies | IndexedDB |
| --- | --- | --- | --- | --- |
| Size | ~5MB | ~5MB | ~4KB | large |
| Lifetime | until cleared | tab session | expiry date | until cleared |
| Sent to server | no | no | **yes** | no |

---

## 16. Memory Management

- Memory is allocated automatically when you create values and freed by the **Garbage Collector**.
- **Mark-and-sweep**: starting from "roots" (global object, call stack), the GC marks everything **reachable**; unmarked objects are deleted. (Reference counting is the old method, which fails with circular references.)

### Common memory leaks

1. Accidental globals (forgot `let`/`const`).
2. Forgotten timers (`setInterval`) and event listeners that are never removed.
3. Closures holding big data.
4. Detached DOM nodes still referenced in JS.
5. Ever-growing caches/arrays.

---

# PART B: NODE.JS

## 17. Node.js Basics and Architecture

### What is Node.js?

An open-source, cross-platform **JavaScript runtime** built on Chrome's **V8 engine** that lets you run JS **outside the browser** (servers, CLI tools, scripts). It is **not** a language, framework or library.

### Why Node.js?

- Same language (JS) on frontend and backend.
- **Non-blocking, event-driven I/O**: handles many connections with few resources.
- Huge ecosystem (npm), fast startup, great for APIs, real-time apps (chat, streaming), microservices.

### Node.js architecture

```text
 Your JS code
      |
 +----v-------------------------------+
 |  Node.js API (fs, http, path ...)   |
 +----+--------------------------------+
      |  Node bindings (C++)
 +----v----------+     +----------------------+
 |  V8 Engine    |     |  libuv               |
 |  (runs JS)    |     |  - Event Loop        |
 +---------------+     |  - Thread Pool (4)   |
                       |  - Async I/O (epoll, |
                       |    kqueue, IOCP)     |
                       +----------------------+
```

- **V8**: compiles and runs JavaScript.
- **libuv** (C library): provides the **event loop**, the **thread pool**, and cross-platform asynchronous I/O.
- **Node bindings / C++ addons**: connect JS to the C/C++ layer (OpenSSL, zlib, c-ares for DNS, llhttp for HTTP parsing).

### Single-threaded model: how does it handle thousands of requests?

1. Your JS code runs on **one main thread** with one event loop.
2. When a request needs I/O (database, file, network), Node **does not wait**. It hands the work to libuv/OS and **registers a callback**.
3. The main thread immediately moves to the next request.
4. When the I/O finishes, the callback is queued and the event loop runs it.

So Node handles many concurrent connections without creating a thread per request (unlike traditional servers such as Apache/Java thread-per-request). This uses far less memory.

### Who does the real work? (important)

| Work type | Handled by |
| --- | --- |
| **Network I/O** (sockets, HTTP) | OS kernel async mechanisms (epoll/kqueue/IOCP), no thread pool needed |
| **File system, DNS lookup (`dns.lookup`), crypto (`pbkdf2`, `scrypt`, `randomBytes`), zlib compression** | libuv **thread pool** (default **4 threads**, change with `UV_THREADPOOL_SIZE`, max 1024) |
| **Your JS code, JSON parsing, loops** | **Main thread** only |

### Blocking vs non-blocking

```javascript
const fs = require("fs");

// Blocking (synchronous): freezes the event loop until the file is read
const data = fs.readFileSync("big.txt", "utf8");

// Non-blocking (asynchronous): the main thread continues
fs.readFile("big.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log("file read");
});
console.log("runs before the file is read");
```

Never use `*Sync` functions in a request handler on a server (fine for startup scripts).

### Node.js vs Browser JS

| Browser | Node.js |
| --- | --- |
| `window`, `document`, DOM | `global`, `process`, no DOM |
| Web APIs (fetch, localStorage) | Core modules (fs, http, os, path) |
| ESM mostly | CommonJS and ESM |
| Sandboxed, no file access | Full file/OS/network access |

### When NOT to use Node.js

**CPU-intensive** tasks (video encoding, image processing, heavy machine learning, big calculations) block the single main thread and make all other requests wait. Fix with `worker_threads`, child processes, a job queue (BullMQ), or a different service (that is why your Python/FastAPI AI microservice fits well).

### Useful globals

`process` (env, argv, exit, memoryUsage, cwd, nextTick), `__dirname`, `__filename` (CommonJS), `Buffer`, `setTimeout/setInterval/setImmediate`, `globalThis`, `console`, `fetch` (built in on modern Node), `URL`, `AbortController`.

---

## 18. Node.js Event Loop (libuv)

Node's event loop (in libuv) has **phases**. Each phase has its own queue of callbacks. The loop goes through them in order, over and over.

```text
   +---------------------------+
+->|          timers           |  setTimeout, setInterval callbacks whose time has come
|  +-------------+-------------+
|  +-------------v-------------+
|  |   pending callbacks       |  some system-level callbacks (e.g. TCP errors)
|  +-------------+-------------+
|  +-------------v-------------+
|  |     idle, prepare         |  internal use
|  +-------------+-------------+
|  +-------------v-------------+      +---------------+
|  |          poll             |<-----+ incoming I/O  |  retrieve new I/O events, run I/O callbacks
|  +-------------+-------------+      +---------------+  (can block here waiting if nothing else is scheduled)
|  +-------------v-------------+
|  |          check            |  setImmediate callbacks
|  +-------------+-------------+
|  +-------------v-------------+
+--+      close callbacks      |  socket.on('close'), etc.
   +---------------------------+
```

**Between every phase (and after each individual callback in modern Node)**, Node empties:

1. the **`process.nextTick` queue** (first), then
2. the **Promise microtask queue**.

### Priority order

```text
sync code  ->  process.nextTick  ->  promise microtasks  ->  timers  ->  I/O (poll)  ->  setImmediate (check)  ->  close
```

### nextTick vs setImmediate vs setTimeout

| | When it runs |
| --- | --- |
| `process.nextTick(fn)` | **Right after the current operation**, before the event loop continues and before promise microtasks. Overuse can **starve** I/O. |
| `Promise.then / queueMicrotask` | After nextTick queue, still before the loop moves to the next phase |
| `setTimeout(fn, 0)` | In the **timers** phase of the next loop iteration (actual min delay is ~1ms) |
| `setImmediate(fn)` | In the **check** phase, right after the poll (I/O) phase of the current iteration |

```javascript
console.log("1 sync");
setTimeout(() => console.log("5 timeout"), 0);
setImmediate(() => console.log("6 immediate"));
Promise.resolve().then(() => console.log("4 promise"));
process.nextTick(() => console.log("3 nextTick"));
console.log("2 sync");
// 1 sync, 2 sync, 3 nextTick, 4 promise, 5 timeout, 6 immediate (timeout vs immediate order from the main module can vary)
```

**Inside an I/O callback**, `setImmediate` **always** runs before `setTimeout(0)` (because the check phase comes right after poll).

```javascript
const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate")); // always first here
});
```

### Thread pool in action

```javascript
const crypto = require("crypto");
// With 4 threads in the pool, 4 hashes run in parallel; the 5th waits for a free thread.
for (let i = 0; i < 5; i++) {
  crypto.pbkdf2("pw", "salt", 1e6, 64, "sha512", () => console.log("done", i));
}
```

### Keeping the loop healthy

- Don't block it with long synchronous loops, huge `JSON.parse`, sync file/crypto functions, catastrophic regex.
- Offload CPU work to `worker_threads`.
- Monitor event loop lag.

---

## 19. Modules, npm, package.json

### CommonJS (default, `.js` files)

```javascript
// math.js
const add = (a, b) => a + b;
module.exports = { add };         // or exports.add = add

// app.js
const { add } = require("./math");
```

### ES Modules

```javascript
// package.json: { "type": "module" }  or use .mjs
export const add = (a, b) => a + b;
import { add } from "./math.js";     // file extension is required in Node ESM
```

### How `require()` works

1. **Resolve** the path (core module? file? `node_modules`?).
2. **Load** the file.
3. **Wrap** it in a function `(exports, require, module, __filename, __dirname) => { ... }` (this is why `__dirname` exists and why each file has private scope).
4. **Execute** it.
5. **Cache** the result in `require.cache`, so a second `require` of the same file returns the same object without re-running it.

`module.exports` vs `exports`: `exports` is a reference to `module.exports`. If you re-assign `exports = ...` the link breaks, so use `module.exports = ...` to export a single thing.

### npm and package.json

- **npm** = Node Package Manager (also yarn, pnpm).
- `package.json`: project metadata, `scripts`, `dependencies` (needed at runtime), `devDependencies` (build/test only).
- `package-lock.json`: locks the **exact** installed versions for repeatable installs.
- Version symbols: `^1.2.3` (allow minor/patch updates), `~1.2.3` (allow patch only), `1.2.3` (exact).
- Commands: `npm init -y`, `npm install pkg`, `npm i -D pkg`, `npm run dev`, `npm ci` (clean install from lock file), `npx`.
- `node_modules` should be in `.gitignore`.

### Environment variables

```javascript
require("dotenv").config();            // loads .env (or `node --env-file=.env app.js` in modern Node)
const port = process.env.PORT || 3000;
```

Never commit `.env` with secrets.

---

## 20. Core Modules

| Module | Purpose |
| --- | --- |
| `fs` / `fs/promises` | read/write/delete files and folders |
| `path` | build safe file paths (`path.join`, `path.resolve`, `path.basename`, `path.extname`) |
| `http` / `https` | create servers and make requests |
| `os` | system info (CPUs, memory, platform) |
| `events` | `EventEmitter` |
| `stream` | process data in chunks |
| `buffer` | binary data |
| `crypto` | hashing, encryption, random bytes |
| `url`, `querystring` | URL parsing |
| `child_process` | spawn other programs/processes |
| `cluster` | multiple Node processes sharing one port |
| `worker_threads` | real threads for CPU work |
| `util` | `promisify`, `inspect` |
| `zlib` | compression |

### fs example (promises version)

```javascript
const fs = require("fs/promises");

async function run() {
  await fs.writeFile("a.txt", "hello");
  const text = await fs.readFile("a.txt", "utf8");
  await fs.appendFile("a.txt", " world");
  await fs.unlink("a.txt"); // delete
}
```

### Plain HTTP server (what Express wraps)

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello" }));
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("Server running on 3000"));
```

### EventEmitter (the base of much of Node)

Many Node objects (streams, servers, process) extend `EventEmitter`. It is the **observer pattern**.

```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("order", (id) => console.log("Order received", id));
emitter.once("start", () => console.log("only the first time"));
emitter.emit("order", 101);
emitter.off("order", handler); // remove listener
```

Events are emitted **synchronously** (listeners run in the order they were added). An `error` event with no listener **throws and crashes** the process.

### util.promisify

```javascript
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
```

### child_process vs cluster vs worker_threads

| | What it is | Use for |
| --- | --- | --- |
| `child_process` | Spawns a **separate process** (any program) | Run shell commands, Python scripts |
| `cluster` | Multiple copies of the **same Node app**, sharing server ports | Use all CPU cores for a server |
| `worker_threads` | **Threads** inside the same process, own V8 + event loop, can share memory | CPU-heavy JS tasks |

---

## 21. Streams and Buffers

### Buffer

A fixed-size chunk of memory for **raw binary data** (outside the V8 heap). Needed for files, images, TCP data.

```javascript
const buf = Buffer.from("hello");        // <Buffer 68 65 6c 6c 6f>
buf.toString("utf8");                    // "hello"
Buffer.alloc(10);                        // 10 zero-filled bytes
```

### Streams

Process data **piece by piece (chunks)** instead of loading it all into memory. Memory efficient and faster to start.

Four types:

1. **Readable** (e.g. `fs.createReadStream`, `req`)
2. **Writable** (e.g. `fs.createWriteStream`, `res`)
3. **Duplex** (both, e.g. a TCP socket)
4. **Transform** (modifies data as it passes, e.g. gzip)

```javascript
const fs = require("fs");
const zlib = require("zlib");

// copy and compress a huge file using almost no memory
fs.createReadStream("big.txt")
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream("big.txt.gz"));

// serve a big video without loading it fully
http.createServer((req, res) => {
  fs.createReadStream("video.mp4").pipe(res);
});
```

- **Backpressure**: when the writable side can't keep up, the readable is paused automatically so memory doesn't explode (`pipe` and `stream.pipeline` handle this). Prefer `stream.pipeline` (handles errors and cleanup).
- Why streams? `fs.readFile` of a 2 GB file would load 2 GB into RAM; a stream uses a few KB at a time.

---

## 22. Express.js and Middleware

**Express** is a minimal web framework on top of Node's `http` module. It adds routing, middleware, and helpers.

```javascript
const express = require("express");
const app = express();

app.use(express.json());              // parse JSON body into req.body

app.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id, q: req.query });
});

app.post("/users", (req, res) => {
  res.status(201).json(req.body);
});

app.listen(3000);
```

### Middleware

A function with access to `req`, `res` and `next`. It runs **between** the request and the final handler, in the **order it was registered**. It can: run code, change `req`/`res`, end the response, or call `next()` to pass control on.

```javascript
// logger middleware
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();                        // without this the request hangs
});

// auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
app.get("/profile", auth, (req, res) => res.json(req.user));

// error-handling middleware: 4 params, registered LAST
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});
```

Types of middleware: application-level, router-level, built-in (`express.json`, `express.static`), third-party (`cors`, `helmet`, `morgan`, `cookie-parser`), error-handling.

### Request flow

```text
Client -> app.use(cors) -> app.use(express.json) -> logger -> auth -> route handler -> response
                                                                          |
                                                      error? -> error-handling middleware
```

### Project structure (MVC-style)

```text
src/
  routes/       URL -> controller mapping
  controllers/  request/response logic
  services/     business logic
  models/       Mongoose schemas
  middleware/   auth, validation, error handler
  config/       db connection, env
  utils/
```

### REST API basics

| Method | Purpose | Idempotent |
| --- | --- | --- |
| GET | read | yes |
| POST | create | no |
| PUT | replace whole resource | yes |
| PATCH | partial update | not guaranteed |
| DELETE | remove | yes |

Status codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized` (not logged in), `403 Forbidden` (logged in but not allowed), `404 Not Found`, `409 Conflict`, `422 Unprocessable`, `429 Too Many Requests`, `500 Internal Server Error`.

### Async errors in Express

In Express 4, errors thrown in an `async` handler are **not** caught automatically; call `next(err)` or wrap the handler (`express-async-errors`, or a small wrapper). Express 5 forwards rejected promises to the error handler automatically.

```javascript
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get("/users", asyncHandler(async (req, res) => res.json(await User.find())));
```

---

## 23. Auth, Security, Error Handling

### Authentication flow with JWT

1. User logs in with email/password.
2. Server checks the password against a **hash** (`bcrypt.compare`), then signs a **JWT** (`jwt.sign({ id }, secret, { expiresIn: "15m" })`).
3. Client stores it (httpOnly cookie is safer than localStorage) and sends it on each request.
4. Server verifies the signature in middleware.

- **JWT** = `header.payload.signature` (Base64 encoded, **signed, not encrypted**: never put secrets in it).
- **Hashing** (one-way, bcrypt/argon2 with salt) for passwords. **Encryption** (two-way) for data you need to read back.
- **Access token + refresh token**: short-lived access token, long-lived refresh token to get new ones.
- **Authentication** = who are you. **Authorization** = what are you allowed to do (roles).
- **Sessions vs JWT**: sessions store state on the server (easy to revoke); JWT is stateless (scales easily, harder to revoke).

### Security checklist

- Validate and sanitize input (`zod`, `joi`, `express-validator`).
- `helmet` (secure headers), `cors` (allow only your frontend origin), `express-rate-limit` (stop brute force/DDoS).
- Prevent **NoSQL injection** (`express-mongo-sanitize`, never pass raw `req.body` into a query), **XSS**, **CSRF** (SameSite cookies / tokens).
- Hash passwords, keep secrets in env variables, use HTTPS, keep dependencies updated (`npm audit`).

### Error handling in Node

- **Operational errors** (invalid input, DB down): handle and respond.
- **Programmer errors** (bugs, `undefined.x`): fix the code.
- Sync: `try/catch`. Async: `try/catch` with `await`, or `.catch()`. Callbacks: check `err` first. Events: listen for `error`.
- Process-level safety nets (log and exit gracefully; don't try to continue):

```javascript
process.on("unhandledRejection", (reason) => { console.error(reason); process.exit(1); });
process.on("uncaughtException", (err) => { console.error(err); process.exit(1); });
```

- **Graceful shutdown**: on `SIGTERM`, stop accepting new connections (`server.close()`), finish ongoing requests, close the DB connection, then exit.

### MongoDB/Mongoose quick notes (your stack)

- **Mongoose**: ODM with schemas, validation, middleware (`pre('save')` to hash passwords), `populate()` for references.
- Use **indexes** for fields you query often; use `lean()` for read-only queries (faster plain objects).
- Reuse **one** DB connection (don't connect per request).

---

## 24. Scaling Node.js

1. **Cluster / PM2**: run one Node process per CPU core (`pm2 start app.js -i max`) with automatic restart and load balancing.
2. **Load balancer** (Nginx, cloud LB) in front of multiple instances. Keep the app **stateless** (store sessions in Redis, not memory).
3. **Caching** with Redis (frequent DB reads, sessions, rate limiting).
4. **Worker threads / queues** (BullMQ + Redis) for heavy or slow jobs (emails, reports, image processing); the API just enqueues and responds.
5. **Database**: indexes, pagination, connection pooling, read replicas.
6. **Compression** (gzip), CDN for static files, HTTP keep-alive.
7. **Microservices**: split services (like your FastAPI AI service) communicating via HTTP/message queues.
8. **Horizontal scaling** (more machines) vs **vertical scaling** (bigger machine).
9. **Monitoring**: logging (`winston`, `pino`), metrics, APM, health-check endpoint.

### cluster example

```javascript
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
  cluster.on("exit", () => cluster.fork()); // restart a dead worker
} else {
  require("./server"); // each worker runs the server (all share the same port)
}
```

### worker_threads example

```javascript
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

if (isMainThread) {
  const w = new Worker(__filename, { workerData: 40 });
  w.on("message", (r) => console.log("fib:", r));
} else {
  const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
  parentPort.postMessage(fib(workerData));
}
```

---

# PART C: INTERVIEW PREP

## 25. Buzzwords Glossary

| Term | Meaning in one line |
| --- | --- |
| **JS Engine (V8)** | Program that parses and executes JavaScript |
| **Runtime** | Engine + APIs + event loop (browser or Node) |
| **JIT compilation** | Compiling hot code to machine code while the program runs |
| **AST** | Tree representation of your code created by the parser |
| **Call stack** | LIFO structure tracking which function is running |
| **Memory heap** | Memory area where objects are stored |
| **Execution context** | Environment (variables, `this`, scope chain) for running code |
| **Hoisting** | Declarations are registered before code runs |
| **TDZ** | Period where `let`/`const` exist but can't be accessed |
| **Scope chain** | Lookup path from inner to outer scopes |
| **Lexical scope** | Scope decided by where code is written |
| **Closure** | Function + its remembered outer variables |
| **Prototype** | Object that other objects inherit from |
| **Prototype chain** | Chain of `__proto__` links used for property lookup |
| **Event loop** | Mechanism that moves queued callbacks onto the empty call stack |
| **Macrotask / task** | `setTimeout`, I/O, UI events |
| **Microtask** | Promise callbacks, `queueMicrotask`; run before the next macrotask |
| **Callback hell** | Deeply nested callbacks |
| **Promise** | Object for the eventual result of async work (pending/fulfilled/rejected) |
| **Thenable** | Any object with a `.then` method |
| **Async/await** | Promise-based syntax that reads like sync code |
| **Non-blocking I/O** | Start the operation, continue working, handle result later |
| **Concurrency vs parallelism** | Interleaving tasks vs running tasks simultaneously |
| **Web Worker** | Browser background thread with its own event loop |
| **Currying** | Turning `f(a,b)` into `f(a)(b)` |
| **Memoization** | Caching function results |
| **Debounce / throttle** | Delay until quiet / limit call rate |
| **HOF** | Function taking or returning a function |
| **IIFE** | Function that runs right after being defined |
| **Pure function** | No side effects, same input gives same output |
| **Immutability** | Not modifying data, creating copies instead |
| **Event bubbling / capturing** | Event travels up / down the DOM tree |
| **Event delegation** | One parent listener handles child events |
| **Polyfill** | Code that adds a missing modern feature to old environments |
| **Transpiler (Babel)** | Converts modern JS to older JS |
| **Bundler (Vite/Webpack)** | Combines modules into optimized files |
| **Tree shaking** | Removing unused exports from bundles |
| **Garbage collection** | Automatic freeing of unreachable memory |
| **Memory leak** | Memory that is still referenced but no longer needed |
| **Node.js** | JS runtime built on V8 + libuv |
| **libuv** | C library giving Node its event loop, thread pool and async I/O |
| **Thread pool** | Worker threads (default 4) used for fs, crypto, dns, zlib |
| **Event-driven architecture** | Program reacts to events using listeners |
| **EventEmitter** | Node's class for emitting and listening to events |
| **Stream** | Chunked data processing (readable, writable, duplex, transform) |
| **Buffer** | Raw binary memory chunk |
| **Backpressure** | Slowing a fast producer when the consumer can't keep up |
| **Middleware** | Function in the request/response pipeline (`req, res, next`) |
| **Cluster** | Multiple Node processes sharing a port to use all cores |
| **Worker threads** | Real threads in Node for CPU-heavy JS |
| **REST** | Architectural style using HTTP methods on resources |
| **CORS** | Browser rule controlling cross-origin requests |
| **JWT** | Signed token holding user claims (`header.payload.signature`) |
| **Idempotent** | Repeating the request gives the same result |
| **Stateless** | Server stores no client session between requests |
| **Graceful shutdown** | Finish in-flight work before the process exits |
| **PM2** | Process manager for Node (restart, cluster, logs) |

---

## 26. Interview Questions and Answers

### Core JavaScript

**1. Is JavaScript compiled or interpreted?**
Both. Modern engines like V8 first interpret to bytecode (Ignition) and then JIT-compile hot code to machine code (TurboFan).

**2. Is JavaScript single-threaded? How does it handle async work?**
Yes, one call stack. Async work (timers, network, I/O) is done by the runtime (Web APIs / libuv), and finished callbacks come back through queues and the event loop when the stack is empty.

**3. Difference between `var`, `let`, `const`?**
`var` is function-scoped, hoisted as `undefined`, re-declarable. `let`/`const` are block-scoped and live in the TDZ before declaration. `const` can't be re-assigned (but objects can be mutated).

**4. What is hoisting?**
During the creation phase, declarations are registered in memory before execution: `var` as `undefined`, functions fully, `let/const/class` uninitialized (TDZ).

**5. What is the TDZ?**
The time between entering the scope and the declaration line of a `let`/`const`, during which accessing it throws a `ReferenceError`.

**6. `==` vs `===`?**
`==` coerces types before comparing, `===` doesn't (strict). Use `===`.

**7. What is `null` vs `undefined`?**
`undefined`: a variable that has not been assigned. `null`: intentional "no value". `typeof null` is `"object"` (legacy bug).

**8. What are the primitive types?**
string, number, bigint, boolean, undefined, null, symbol.

**9. What is NaN? How do you check for it?**
"Not a Number", type `number`, not equal to itself. Use `Number.isNaN(x)`.

**10. Explain pass by value vs pass by reference.**
Primitives are copied by value. Objects/arrays/functions are copied by reference (both variables point to the same memory).

**11. Shallow copy vs deep copy?**
Shallow (`{...obj}`) copies top-level only; nested objects are shared. Deep copy duplicates everything (`structuredClone`, or `JSON.parse(JSON.stringify())` with limitations).

**12. What is the scope chain / lexical scope?**
A variable is looked up in the current scope, then outward through parent scopes, based on where functions are *written*. JS is lexically scoped, not dynamically scoped.

**13. What is a closure? Give a use case.**
A function that remembers variables from the scope where it was created even after that scope has ended. Uses: private data, function factories, memoization, debounce, event handlers.

**14. Can closures cause memory leaks?**
Yes, if a long-lived closure keeps references to large objects that are no longer needed.

**15. Output of `for (var i=0;i<3;i++) setTimeout(()=>console.log(i))`?**
`3 3 3`, because `var` shares one `i`. Using `let` gives `0 1 2` since each iteration has its own binding.

**16. What is `this`?**
The object that calls/owns the running function; decided at call time for normal functions, lexically for arrow functions. (See table in section 6.)

**17. Arrow function vs normal function?**
Arrow functions have no own `this`, `arguments`, `prototype` and can't be used with `new`.

**18. `call` vs `apply` vs `bind`?**
All set `this`. `call(this, a, b)` runs now with separate args; `apply(this, [a, b])` runs now with an array; `bind(this, a, b)` returns a new function to call later.

**19. What does the `new` keyword do?**
Creates an empty object, links its prototype to the constructor's `prototype`, runs the constructor with `this` set to the object, and returns it.

**20. What is the prototype and prototype chain?**
Every object has a hidden `[[Prototype]]` link. Property lookup goes object -> its prototype -> ... -> `null`. This is how inheritance works in JS.

**21. Are JS classes real classes?**
They are **syntactic sugar** over constructor functions and prototypes.

**22. `__proto__` vs `prototype`?**
`prototype` is a property of **functions** (used when creating instances with `new`). `__proto__` is the link on **instances** pointing to their constructor's `prototype`.

**23. What does `super` do?**
In a constructor `super(...)` calls the parent constructor (required before using `this`). `super.method()` calls the parent's method.

**24. What are higher-order functions?**
Functions that take functions as arguments or return functions (`map`, `filter`, `reduce`).

**25. `map` vs `forEach`?**
`map` returns a new array of the results; `forEach` returns `undefined` and is used for side effects only.

**26. What does `reduce` do?**
Folds an array into one value using an accumulator: `arr.reduce((acc, x) => acc + x, 0)`.

**27. `slice` vs `splice`?**
`slice` returns a copy of part of an array (no mutation). `splice` adds/removes elements in place (mutates).

**28. What is currying? Why use it?**
Converting a multi-argument function into a chain of single-argument functions; enables partial application and reuse.

**29. What is the difference between `Object.freeze` and `const`?**
`const` stops re-assignment of the variable. `freeze` stops changes to the object's properties (shallow).

**30. What are template literals, spread, rest, destructuring?**
Backtick strings with `${}`; `...` expanding values; `...` collecting remaining values; unpacking values from arrays/objects into variables.

**31. `for...in` vs `for...of`?**
`for...in` iterates enumerable **keys** of an object; `for...of` iterates **values** of iterables (arrays, strings, Maps, Sets).

**32. What is a `Symbol`/`Map`/`Set`/`WeakMap`?**
Symbol: unique identifier. Map: key-value with any key type, ordered. Set: unique values. WeakMap: keys are objects held weakly so they can be garbage collected.

**33. What is optional chaining and nullish coalescing?**
`a?.b` avoids errors on null/undefined. `a ?? b` falls back only for null/undefined (not for `0` or `""`, unlike `||`).

**34. What is event bubbling, capturing, delegation?**
Events travel down (capturing) then up (bubbling) the DOM. Delegation uses one parent listener plus `e.target` to handle many children.

**35. `e.target` vs `e.currentTarget`?**
`target` is the element clicked; `currentTarget` is the element the handler is attached to.

**36. Debounce vs throttle?**
Debounce waits until the events stop; throttle limits execution to once per interval.

**37. `localStorage` vs `sessionStorage` vs cookies?**
See table in section 15. Cookies are sent to the server with every request, the others are not.

**38. What is a polyfill?**
Code that implements a modern feature in environments that don't support it.

**39. What is strict mode?**
`"use strict"` makes JS throw errors for unsafe actions (undeclared variables, etc.) and sets `this` to `undefined` in plain functions.

**40. What is the difference between ESM and CommonJS?**
ESM uses `import/export`, is static and async; CommonJS uses `require/module.exports`, is dynamic and synchronous.

### Event loop and async

**41. Explain the event loop.**
JS runs sync code on the call stack. Async tasks are given to Web APIs/libuv. When done, their callbacks wait in queues. The event loop checks whether the stack is empty and then pushes callbacks: **all microtasks first**, then **one macrotask**, repeating.

**42. Microtask vs macrotask?**
Microtasks (promise callbacks, `queueMicrotask`) have higher priority and are fully drained after each task. Macrotasks (`setTimeout`, I/O, events) run one per loop turn.

**43. What is the output?**

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

`A D C B`.

**44. Does `setTimeout(fn, 0)` run immediately?**
No. It is queued as a macrotask and runs only after the current sync code and all microtasks are finished.

**45. What is a callback? What is callback hell? How to avoid it?**
A function passed to be called later. Nested callbacks create a pyramid. Avoid with promises, async/await, and splitting into named functions.

**46. What are the states of a promise?**
pending, fulfilled, rejected (a settled promise never changes).

**47. `Promise.all` vs `allSettled` vs `race` vs `any`?**
`all`: all succeed or the first failure rejects. `allSettled`: waits for all, reports each. `race`: first to settle. `any`: first to succeed.

**48. What does an `async` function return?**
Always a promise. A returned value is wrapped in a resolved promise, a thrown error becomes a rejection.

**49. What does `await` do?**
Pauses the async function (not the thread) until the promise settles; the rest of the function resumes as a microtask.

**50. How do you run async tasks in parallel with await?**
`await Promise.all([taskA(), taskB()])`. Sequential `await a(); await b();` runs them one after another.

**51. Why doesn't `await` work inside `forEach`?**
`forEach` ignores the returned promises and doesn't wait. Use `for...of` or `Promise.all(arr.map(async ...))`.

**52. How do you handle errors in async/await?**
`try/catch` around `await`, or `.catch()` on the promise.

**53. Does `fetch` reject on a 404?**
No. It rejects only on network failure. Check `response.ok` or `response.status`.

**54. What is `Promise.resolve().then(...)` used for?**
Scheduling a microtask / wrapping a value in a promise.

**55. What is an unhandled promise rejection?**
A rejected promise with no `.catch`/`try-catch`. In Node it can crash the process; in browsers it logs an error.

**56. How can you achieve real multithreading in JS?**
Web Workers in the browser; `worker_threads` or `child_process`/`cluster` in Node.

**57. What happens if you block the main thread?**
Nothing else runs: UI freezes in the browser, or all requests wait in Node.

### Node.js

**58. What is Node.js?**
A cross-platform JavaScript runtime built on V8 and libuv for running JS outside the browser, designed for scalable, event-driven, non-blocking I/O.

**59. Is Node.js single-threaded?**
Your JavaScript runs on a single main thread, but Node itself uses extra threads: a libuv thread pool (default 4) for fs/crypto/dns/zlib, plus V8 helper threads (GC, compilation). Network I/O uses OS async mechanisms.

**60. How does Node handle many concurrent requests with one thread?**
By never blocking: I/O is delegated to the OS/libuv with callbacks registered; the event loop processes completed operations as they arrive.

**61. What is libuv?**
A C library that provides the event loop, thread pool, and cross-platform async I/O to Node.

**62. Explain the phases of the Node event loop.**
timers -> pending callbacks -> idle/prepare -> poll -> check -> close callbacks. `nextTick` and promise microtasks run between phases.

**63. `process.nextTick` vs `setImmediate` vs `setTimeout(0)`?**
`nextTick` runs right after the current operation (before promises). `setTimeout(0)` runs in the timers phase. `setImmediate` runs in the check phase after poll.

**64. What is the output order of: sync, nextTick, promise, setTimeout, setImmediate?**
sync, nextTick, promise, then timeout/immediate (timeout vs immediate order isn't guaranteed from the main module; inside an I/O callback immediate is first).

**65. Blocking vs non-blocking code?**
Blocking stops the event loop until done (`readFileSync`); non-blocking lets the loop keep running (`readFile` with callback/promise).

**66. What is the thread pool and when is it used?**
libuv's pool (default 4 threads) used for fs, crypto (pbkdf2, scrypt), `dns.lookup`, zlib. Not used for network sockets.

**67. How do you do CPU-intensive work in Node?**
`worker_threads`, child processes, a job queue, or offload to another service (e.g. a Python microservice).

**68. What are streams? Why use them?**
Chunked data handling: lower memory and faster time-to-first-byte. Types: readable, writable, duplex, transform. Use `pipe`/`pipeline` for backpressure.

**69. What is a Buffer?**
A fixed chunk of raw binary memory outside the V8 heap.

**70. What is EventEmitter?**
Node's class implementing the observer pattern (`on`, `emit`, `once`, `off`). Streams, servers and `process` inherit from it.

**71. `require` vs `import`?**
`require` is CommonJS (sync, dynamic, cached). `import` is ESM (static, async). Enable ESM with `"type": "module"` or `.mjs`.

**72. What does `module.exports` vs `exports` do?**
`exports` is just a reference to `module.exports`. Assigning to `exports` directly breaks the link; use `module.exports = ...`.

**73. What are `dependencies` vs `devDependencies`?**
Runtime packages vs development-only tools (testing, linting, nodemon).

**74. What is `package-lock.json`?**
Records exact versions of every installed package for reproducible installs.

**75. What is middleware in Express?**
A function `(req, res, next)` in the request pipeline. It can modify req/res, end the response, or call `next()`.

**76. How do you handle errors in Express?**
Error-handling middleware with four params `(err, req, res, next)` registered after all routes; pass errors with `next(err)`.

**77. PUT vs PATCH? 401 vs 403?**
PUT replaces the full resource; PATCH updates part of it. 401 = not authenticated; 403 = authenticated but not allowed.

**78. How does JWT authentication work?**
Server signs a token on login; the client sends it on every request; middleware verifies the signature and expiry and attaches the user to `req`.

**79. How do you store passwords?**
Never in plain text. Hash with a salted slow algorithm (bcrypt/argon2).

**80. How do you scale a Node.js app?**
Cluster/PM2 for all cores, multiple instances behind a load balancer (stateless app), Redis caching, queues for heavy jobs, DB indexing, microservices.

**81. `cluster` vs `worker_threads` vs `child_process`?**
Cluster: multiple process copies of a server sharing a port. Workers: threads in one process for CPU work. Child process: spawn any other program.

**82. What is CORS and how do you enable it in Express?**
A browser mechanism restricting cross-origin requests. Use the `cors` middleware to set allowed origins/headers on the server.

**83. How do you keep a Node app running in production?**
A process manager (PM2, systemd, Docker/Kubernetes) with auto-restart, logs, and graceful shutdown.

**84. What is the purpose of `process.env`?**
Access environment variables for config and secrets (ports, DB URLs, keys).

**85. Is `fs.readFile` of a huge file a good idea?**
No, it loads everything in memory; use `createReadStream`.

**86. How would you avoid callback hell in Node?**
`util.promisify`, `fs/promises`, async/await, and error-first callback conventions.

**87. What is the difference between `spawn`, `exec`, `fork`?**
`spawn` streams output for any command; `exec` buffers output and returns it in a callback; `fork` spawns a new Node process with an IPC channel.

**88. Does Node.js handle each request in a new thread?**
No. All requests run on the same event loop; only offloaded tasks use pool threads.

---

## 27. Coding Practice Questions

Try on your own first. Solutions follow.

### Beginner

1. Reverse a string / check if a string is a palindrome.
2. Find the largest number in an array without `Math.max`.
3. Count the frequency of each character in a string.
4. Remove duplicates from an array.
5. FizzBuzz.
6. Flatten a nested array.
7. Check if two strings are anagrams.
8. Factorial and Fibonacci (loop and recursion).

### Intermediate (very common)

9. Write your own `map`, `filter`, `reduce` (polyfills).
10. Write `debounce` and `throttle`.
11. Write `bind` polyfill.
12. Implement `memoize`.
13. Implement `curry` (`sum(1)(2)(3)`) and an `add(1,2)(3)` variadic version.
14. Deep clone an object.
15. Implement `Promise.all` polyfill.
16. Create a counter using closure (private variable).
17. Implement a `sleep(ms)` function and `retry(fn, times)`.
18. Group an array of objects by a key.
19. Two sum, find the first non-repeating character.
20. Run async tasks in sequence and in parallel.

### Node.js tasks

21. Create an HTTP server with plain `http` returning JSON for 2 routes.
22. Build an Express CRUD API with validation and an error-handling middleware.
23. Write a JWT auth middleware.
24. Read a large file with a stream and count lines.
25. Make an EventEmitter-based logger.
26. Write a rate limiter middleware (N requests per minute per IP).

---

### Solutions

#### 1. Reverse and palindrome

```javascript
const reverse = (s) => s.split("").reverse().join("");
const isPalindrome = (s) => {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === reverse(clean);
};
```

#### 3. Character frequency

```javascript
function freq(str) {
  const map = {};
  for (const ch of str) map[ch] = (map[ch] || 0) + 1;
  return map;
}
```

#### 4. Remove duplicates

```javascript
const unique = (arr) => [...new Set(arr)];
```

#### 6. Flatten (recursive)

```javascript
function flatten(arr) {
  return arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flatten(x) : x), []);
}
// built in: arr.flat(Infinity)
```

#### 7. Anagram

```javascript
const isAnagram = (a, b) =>
  a.toLowerCase().split("").sort().join("") === b.toLowerCase().split("").sort().join("");
```

#### 8. Fibonacci

```javascript
function fib(n) {              // iterative O(n)
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
```

#### 9. map / filter / reduce polyfills

```javascript
Array.prototype.myMap = function (cb, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) result.push(cb.call(thisArg, this[i], i, this));
  }
  return result;
};

Array.prototype.myFilter = function (cb, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) result.push(this[i]);
  }
  return result;
};

Array.prototype.myReduce = function (cb, initial) {
  let acc = initial;
  let start = 0;
  if (arguments.length < 2) {
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    acc = this[0];
    start = 1;
  }
  for (let i = start; i < this.length; i++) acc = cb(acc, this[i], i, this);
  return acc;
};
```

#### 10. Debounce and throttle

```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```

#### 11. bind polyfill

```javascript
Function.prototype.myBind = function (context, ...boundArgs) {
  const fn = this;
  return function (...args) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};
```

#### 12. Memoize

```javascript
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

#### 13. Curry

```javascript
function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : (...next) => curried.apply(this, [...args, ...next]);
  };
}
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3); add3(1, 2)(3); // 6

// infinite currying: sum(1)(2)(3)()
const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
```

#### 14. Deep clone

```javascript
function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (seen.has(obj)) return seen.get(obj);            // circular references
  if (obj instanceof Date) return new Date(obj);
  const copy = Array.isArray(obj) ? [] : {};
  seen.set(obj, copy);
  for (const key of Object.keys(obj)) copy[key] = deepClone(obj[key], seen);
  return copy;
}
// or simply: structuredClone(obj)
```

#### 15. Promise.all polyfill

```javascript
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;
    if (promises.length === 0) return resolve([]);
    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((val) => {
          results[i] = val;                 // keep original order
          if (++completed === promises.length) resolve(results);
        })
        .catch(reject);                     // first rejection rejects all
    });
  });
}
```

#### 16. Closure counter

```javascript
function counter() {
  let count = 0;
  return { inc: () => ++count, dec: () => --count, get: () => count };
}
```

#### 17. sleep and retry

```javascript
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function retry(fn, times = 3, delay = 500) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === times - 1) throw err;
      await sleep(delay);
    }
  }
}
```

#### 18. Group by

```javascript
const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    (acc[item[key]] ||= []).push(item);
    return acc;
  }, {});
```

#### 19. Two sum (O(n)) and first non-repeating character

```javascript
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}

function firstUnique(str) {
  const count = {};
  for (const c of str) count[c] = (count[c] || 0) + 1;
  return [...str].find((c) => count[c] === 1);
}
```

#### 20. Sequential vs parallel async

```javascript
// sequential
for (const id of ids) {
  await fetchUser(id);
}
// parallel
await Promise.all(ids.map((id) => fetchUser(id)));
// parallel with a concurrency limit: process in chunks of N
```

#### 21. Plain HTTP server with routes

```javascript
const http = require("http");

http
  .createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "GET" && req.url === "/health") {
      return res.end(JSON.stringify({ status: "ok" }));
    }
    if (req.method === "POST" && req.url === "/echo") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => res.end(JSON.stringify({ received: JSON.parse(body || "{}") })));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Not found" }));
  })
  .listen(3000);
```

#### 22. Express CRUD (in-memory) with error handler

```javascript
const express = require("express");
const app = express();
app.use(express.json());

let users = [];
let nextId = 1;

app.get("/users", (req, res) => res.json(users));

app.post("/users", (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) return next(Object.assign(new Error("name and email required"), { status: 400 }));
  const user = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json(user);
});

app.put("/users/:id", (req, res, next) => {
  const user = users.find((u) => u.id === +req.params.id);
  if (!user) return next(Object.assign(new Error("User not found"), { status: 404 }));
  Object.assign(user, req.body);
  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  users = users.filter((u) => u.id !== +req.params.id);
  res.status(204).end();
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

app.listen(3000);
```

#### 23. JWT middleware

```javascript
const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Forbidden" });

// app.delete("/users/:id", protect, authorize("admin"), handler);
```

#### 24. Count lines with a stream

```javascript
const fs = require("fs");
const readline = require("readline");

async function countLines(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let count = 0;
  for await (const _ of rl) count++;
  return count;
}
```

#### 25. EventEmitter logger

```javascript
const EventEmitter = require("events");

class Logger extends EventEmitter {
  log(msg) {
    this.emit("message", { msg, time: new Date().toISOString() });
  }
}

const logger = new Logger();
logger.on("message", (data) => console.log(`[${data.time}] ${data.msg}`));
logger.log("server started");
```

#### 26. Simple rate limiter middleware

```javascript
function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
  const hits = new Map(); // ip -> { count, resetAt }
  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || now > entry.resetAt) {
      hits.set(req.ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (++entry.count > max) return res.status(429).json({ message: "Too many requests" });
    next();
  };
}
// app.use(rateLimit({ windowMs: 60_000, max: 5 }));
```

---

### Output-prediction questions

**Q1.**

```javascript
console.log(typeof null, typeof undefined, typeof NaN, typeof []);
```

`object undefined number object`

**Q2.**

```javascript
console.log(a);
var a = 5;
console.log(b);
let b = 5;
```

`undefined`, then `ReferenceError` (TDZ).

**Q3.**

```javascript
const obj = {
  name: "A",
  regular() { return this.name; },
  arrow: () => this.name,
};
console.log(obj.regular(), obj.arrow());
```

`"A"` and `undefined` (arrow `this` is the outer scope, not `obj`).

**Q4.**

```javascript
const fn = obj.regular;
console.log(fn());
```

`undefined` (the method lost its object, so `this` is `window`/`undefined`).

**Q5.**

```javascript
console.log([] + [], [] + {}, 1 + "2", "3" - 1, true + 1);
```

`"" "[object Object]" "12" 2 2`

**Q6.**

```javascript
console.log(0.1 + 0.2 === 0.3);
```

`false` (floating-point precision). Compare with `Math.abs(a - b) < Number.EPSILON`.

**Q7.**

```javascript
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("tick"));
console.log("sync");
```

Node: `sync, tick, promise, timeout`.

**Q8.**

```javascript
async function a() { console.log(1); await b(); console.log(2); }
async function b() { console.log(3); }
a();
console.log(4);
```

`1 3 4 2` (code after `await` runs as a microtask).

**Q9.**

```javascript
const a = { x: 1 };
const b = a;
b.x = 2;
console.log(a.x, a === b, { x: 1 } === { x: 1 });
```

`2 true false`

**Q10.**

```javascript
console.log([1, 2, 3].map(parseInt));
```

`[1, NaN, NaN]` because `map` passes `(value, index)` and `parseInt(value, radix)` receives the index as the radix.

---

## Final Revision Checklist

**JavaScript**

- [ ] Engine (V8), JIT, call stack, heap, execution context (2 phases)
- [ ] Hoisting, TDZ, `var/let/const`
- [ ] Data types, coercion, `==` vs `===`, truthy/falsy, copy by value/reference
- [ ] Lexical scope, scope chain (JS is NOT dynamically scoped)
- [ ] Closures: definition, uses, loop problem, memory
- [ ] `this` table, arrow vs normal, `call/apply/bind`
- [ ] Prototype, prototype chain, `new`, classes, `extends/super`
- [ ] Event loop: sync -> microtasks -> macrotask (predict output!)
- [ ] Callbacks -> Promises (3 states, combinators) -> async/await, parallel vs sequential
- [ ] Fetch: `response.ok`, POST, AbortController
- [ ] Array methods, ES6+ features, event bubbling/delegation, debounce/throttle

**Node.js**

- [ ] V8 + libuv architecture, single thread + thread pool, what runs where
- [ ] Event loop phases, `nextTick` vs `setImmediate` vs `setTimeout`
- [ ] CommonJS vs ESM, how `require` works, `package.json`
- [ ] Core modules: fs, path, http, events, stream, crypto
- [ ] Streams, buffers, backpressure
- [ ] Express middleware, error-handling middleware, REST codes
- [ ] JWT auth flow, password hashing, security basics
- [ ] Scaling: cluster/PM2, worker threads, Redis, queues, load balancer
- [ ] Practice: polyfills (map, bind, Promise.all), debounce/throttle, memoize, curry, deepClone, CRUD API, JWT middleware

Good luck with your interviews!