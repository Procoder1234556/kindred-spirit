const fs = require("fs");

const files = [
  "Only Spare parts.csv",
  "only accessories.csv",
  "only tools.csv",
];

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, "utf-8");
    const firstLine = content.split(/\r?\n/)[0];
    console.log(`\n--- ${file} ---`);
    console.log(firstLine);
  } catch (e) {
    console.log(`Error reading ${file}:`, e.message);
  }
});
