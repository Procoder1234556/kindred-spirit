const fs = require("fs");
const readline = require("readline");

async function processLineByLine() {
  const fileStream = fs.createReadStream("e:/Sahii/Sahii/Only Spare parts.csv");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    console.log("Header columns:", line.split(","));
    break; // Only read the first line
  }
}

processLineByLine();
