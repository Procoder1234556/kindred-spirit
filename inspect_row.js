const fs = require("fs");
const csv = require("csv-parser");

fs.createReadStream("e:/Sahii/Sahii/Only Spare parts.csv")
  .pipe(csv())
  .on("data", (row) => {
    console.log("First Row Keys:", Object.keys(row));
    console.log("First Row Data:", row);
    process.exit();
  });
