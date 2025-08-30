port = 1234;
var t0 = Date.now();
const express = require("express");
var f = ["/weici.db"];

var app = express();
app.get("*", (req, res) => {
  console.log(req.url);
  if (req.url.startsWith("/?")) {
    res.sendFile(process.cwd() + "/index.html");
  } else if (f.includes(req.url) && req.method.toLowerCase() == "get") {
    console.log(req.url.endsWith("/") ? req.url + "index.html" : req.url);
    res.sendFile(
      process.cwd() +
        (req.url.endsWith("/") ? req.url + "index.html" : req.url),
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});
app.listen(port);
var t1 = Date.now();
console.log("Run at http://localhost:" + port, t1 - t0 + "ms");
