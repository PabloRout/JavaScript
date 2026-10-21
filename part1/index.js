let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log(arr.filter((val) => val > 4));

console.log(
  arr.reduce((accumulator, val) => {
    return accumulator + val;
  }, 100),
);

arr2 = [
  { id: 1, key: 1 },
  { id: 2, key: 2 },
  { id: 3, key: 2 },
  { id: 4, key: 4 },
  { id: 5, key: 1 },
];
console.log(arr2.find((val) => val.key === 2));

let arr3 = [10, 30, 50, 70, 80, 90, 100];
console.log(arr3.some((val) => val >= 70));
