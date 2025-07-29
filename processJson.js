const fs = require("fs");
const { pool } = require("./db");

// splitting lines based on commas
function parseLine(line) {
  return line.split(",").map((cell) => cell.trim());
}

// to map nested objects
function toNestedObject(keys, value) {
  return keys.reduceRight((acc, key) => ({ [key]: acc }), value);
}

// to merge multiple nested objects
function mergeObjects(list) {
  const result = {};

  for (let obj of list) {
    for (let key in obj) {
      if (typeof result[key] === "object" && typeof obj[key] === "object") {
        result[key] = mergeObjects([result[key], obj[key]]);
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
}

const processCsv = async (req, res) => {
  try {
    const file = "C:\\Users\\Suvedha\\OneDrive\\Desktop\\CSVtoJSON\\sample.csv";
    const lines = fs.readFileSync(file, "utf-8").split("\n");

    const headers = parseLine(lines[0]);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      const nestedFields = headers.map((header, idx) =>
        toNestedObject(header.split("."), row[idx])
      );
      const json = mergeObjects(nestedFields);
      records.push(json);
    }

    // insertion
    for (let person of records) {
      await pool.query(
        "INSERT INTO jsondata (name, age, address, gender) VALUES ($1, $2, $3, $4)",
        [person.name, person.age, person.address, person.gender]
      );
    }

    // age reports
    const { rows } = await pool.query("SELECT age FROM jsondata");

    const distribution = {
      "Under 18": 0,
      "18 to 30": 0,
      "31 to 45": 0,
      "46 to 60": 0,
      "Above 60": 0,
    };

    for (let row of rows) {
      const age = parseInt(row.age);

      if (age < 18) distribution["Under 18"]++;
      else if (age <= 30) distribution["18 to 30"]++;
      else if (age <= 45) distribution["31 to 45"]++;
      else if (age <= 60) distribution["46 to 60"]++;
      else distribution["Above 60"]++;
    }

    console.log("\nAge Distribution Report:");
    console.log(distribution);

    res.json({ message: "CSV uploaded and saved to database" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { processCsv };
