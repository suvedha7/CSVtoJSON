const express = require("express");
const { processCsv } = require("./processJson");

const app = express();

app.get("/", processCsv);

app.listen(4000, () => {
  console.log("Server is running ...");
});
