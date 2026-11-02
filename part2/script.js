import { log } from "console";
import fs from "fs";

fs.readFile("part2/textFile.txt", "utf-8", (err, res) => {
  if (!err) log(res);
  else log(err);
});

const result = fs.readFileSync("part2/textFile.txt", "utf-8");
log(result);
