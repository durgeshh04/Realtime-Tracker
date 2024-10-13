const express = require("express");
const http = require("http");
const path = require("path");
require("dotenv").config();

const app = express();

// boiler-plate for using socketio in our application
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);


app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello World from server");
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
