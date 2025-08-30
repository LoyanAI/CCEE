const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("weici.db");

db.run(`CREATE TABLE IF NOT EXISTS items(name TEXT, content TEXT)`);

exports.insert = (name, content) =>
  new Promise((resolve, reject) =>
    db.run(
      "INSERT INTO items(name, content) VALUES (?, ?)",
      [name, content],
      function (err) {
        err ? reject(err) : resolve(this.lastID);
      },
    ),
  );
