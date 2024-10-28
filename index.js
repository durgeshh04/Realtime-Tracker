const express = require("express");
const http = require("http");
const path = require("path");
require("dotenv").config();

const app = express();

// Setup for using socket.io
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for location data from the client
  socket.on("send-location", (data) => {
    // Broadcast the location data to all clients
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Optionally, notify other clients that this user has disconnected
    io.emit("user-disconnected", { id: socket.id });
  });
});

app.get("/", (req, res) => {
  res.render("app");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
