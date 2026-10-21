const fs = require("fs");
let fun = () => {
  return new Promise((resolve, reject) => {
    let condition = false;
    setTimeout(() => {
      if (condition) resolve({ payload: "Success" });
      else reject({ payload: "error" });
    }, 2000);
  });
};
fun()
  .then((val) => {
    console.log(val);
  })
  .catch((err) => {
    console.log(err);
  });

fs.readFile("part3/example.txt", "utf-8", (error, data) => {
  if (error) {
    console.log("Error happen");
    return;
  }
  console.log(data);
});
