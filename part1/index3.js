let admin = true;
let obj = {
  name: "Gyaneswar",
  age: 22,
  email: "gyaneswarrout@gmail.com",
  address: {
    city: "cuttack",
    location: {
      lon: 1231432.34234,
      lat: 23426.45345,
    },
  },
  ["admin"]: true,
};

// let aa = "name";
// console.log(obj[aa]);
// console.log(obj.name);

// let { name, age } = obj;

// console.log(name);
// console.log(age);

// for (let key in obj) {
//   console.log(`${key}:${obj[key]}`);
// }

// console.log(Object.keys(obj));
// console.log(Object.entries(obj));

// let obj2 = JSON.parse(JSON.stringify(obj));

// obj2.address.city = "Bejing";
// console.log(obj);
// console.log(obj2);

console.log(obj?.address?.city);
console.log(obj);
