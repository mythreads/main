const express = require("express");
const cowsay = require("cowsay");
const cors = require("cors");
const path = require("path");

// Create the server
const app = express();

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? true : false,
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "client/build")));

// Serve our api route /cow that returns a custom talking text cow
app.get("/api/cow/:say", cors(), async (req, res, next) => {
  try {
    const text = req.params.say;
    const moo = cowsay.say({ text });
    res.json({ moo });
  } catch (err) {
    next(err);
  }
});

// Serve our base route that returns a Hellow World cow
app.get("/api/cow/", cors(), async (req, res, next) => {
  try {
    const moo = cowsay.say({ text: "Hello World!" });
    res.json({ moo });
  } catch (err) {
    next(err);
  }
});

app.get("/db", async (req, res) => {
  console.log(process.env.DATABASE_URL);
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM test_table");
    const results = { results: result ? result.rows : null };
    res.render("pages/db", results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// Anything that doesn't match the above, send back the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

// Choose the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`);
});
