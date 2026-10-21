import fs from "fs";

fs.readFile("part2/textFile.txt", "utf-8", (err, res) => {
  console.log(res);
});

let res = fs.readFileSync("part2/textFile.txt", "utf-8");
console.log(res);
