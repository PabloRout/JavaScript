# JS 

## scope

### lexical

```javascript
function abcd() {
  // a is lexical scoped with abcd()
  let a = 12;
  function defg() {
    console.log(a);
  }
}

```

### dynamically scope

```javascript

let a = 12;
function abcd() {
  console.log(a);
}

function defg() {
  let a = 13;
  abcd();
}
defg();

```

## closures

- closure is a concept where a parent function returns a child function and child function uses a variable of parent function
- private variables
- global pollution

```javascript
function abcd() {
  let a = 12;
  return function () {
    console.log(a);
  };
}

abcd()();
let f = abcd();
f();

```

- how variable is preserved
- `
after end of the parent function all its variables are deleted but in case of closure it creates a <b>backlink</b> which is [[environment]]
`

## this keyword

### this scopes

- global scope
  - window
- function scope
  - window
- object method
  - object
  - if the function is arrow then it will refers to the window
  
```javascript
      let obj = {
        name: "gyana",
        age: 22,
        sayName: function () {
          console.log(this.age);
        },
      };

      obj.sayName();

```

- document
  - currently selected element

  - ```javascript
      document.querySelector("h1").addEventListener("click", () => {
        alert(this);
      });

    ```

- classes
  - in class it is blank object

  - ```javascript
      class MyClass {
        constructor() {
          console.log("heyhey");
          this.a = 12;
        }
      }
      
      let val = new MyClass();
      console.log(val);      
    ```

`
global - window
function - window
method with es5 function - object
method with es6 arrow function - window
es5 function inside es5 method - window
arrow function inside es5 method - object
event handler - element
class - blank object
`

### binding

- during calling the function we can set the this value of it

- call ⤵

- ``` javascript
  let obj = {
    name: "gyaneswar",
    age: 22,
  };

  function abcd(a, b, c) { // we can pass the arguments like this
    console.log(this, a, b, c);
  }

  abcd.call(obj, 1, 2, 3);

  ```

- apply ⤵

- ``` javascript
  let obj = {
    name: "gyaneswar",
    age: 22,
  };

  function abcd(a, b, c) { 
    console.log(this, a, b, c);
  }

  abcd.apply(obj, [1, 2, 3]); // but here we can only send two parameters

  ```

- bind ⤵

- ``` javascript
    let obj = {
      name: "gyaneswar",
      age: 22,
    };

    function abcd(a, b, c) {
      console.log(this, a, b, c);
    }

    let fun = abcd.bind(obj, 1, 2, 3); // it returns functions
    fun();

    ```

## OOPs(Object Orient Programmings)

### create using (constructor)Function

``` javascript
function CreatePencil(name, price, color, company) {
  this.name = name;
  this.price = price;
  this.color = color;
  this.company = company;
}

let pencil1 = new CreatePencil("Natraj", 10, "black", "nataraj");

console.log(pencil1);

```

- Prototype

``` javascript

function CreatePencil(name, price, color) {
  this.name = name;
  this.price = price;
  this.color = color;
}

CreatePencil.prototype.company = "Dome";
// shared between all the objects its like static value
```

### class

``` javascript
class CreatePencil {
  constructor(name, company, price, color) {
    this.name = name;
    this.company = company;
    this.price = price;
    this.color = color;
  }

  write(text) {
    let h1 = document.createElement("h1");
    h1.textContent = text;
    h1.style.color = this.color;
    document.body.appendChild(h1);
  }
}

```

### extend and super

- this is classical inhetirance
- class -> class

``` javascript
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
    super(name, address, username, email);
    this.role = "admin";
  }

  remove() {
    let h1 = document.querySelectorAll("h1")
    .forEach((e) => {
      e.remove();
    });
  }
}
```

### prototype inhetitance

- object -> object

``` javascript
let coffee = {
  color: "dark",
  drink: function () {
    console.log("good good good ❤️‍🔥");
  },
};

let arabiataCoffee = Object.create(coffee);
arabiataCoffee.taste = "bitter";
arabiataCoffee.drink();
console.log(arabiataCoffee);

```

### asynchronous and synchronous

- do not wait
- wait for complete

### callback pattern and callback hell

- when one function is being provided by another funciton then the provided funciton is called callback function

``` javascript
function profileLekarAao(username, cb) {
  console.log("fetching profile data.....");

  setTimeout(() => {
    console.log(`profile fethed ${username}`);
    cb(username);
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
    cb({ _id: id, saved: [1, 2, 4, 4, 5, 345, 5, 77, 34] });
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

- nested callbacks are called callback hell

## Promises and async

### Promises

- it can take one state between two either it can be resolved or can be rejected
- we write code for both

``` javascript
let pr = new Promise((res, rej) => {
  setTimeout(() => {
    let rn = Math.floor(Math.random() * 10);
    rn > 5 ? res(`Resolved ${rn}`) : rej(`Rejected ${rn}`);
  }, 3000);
});

pr.then((val) => {
  console.log(val);
}).catch((val) => {
  console.error(val);
});

```

### async & await

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

## api fetching

### fetch api

``` javascript
fetch("https://randomuser.me/api/")
  .then((rawData) => rawData.json())
  .then((data) => {
    console.log(data.results[0].name);
  })
  .catch((err) => {
    console.error(err);
  });

```
