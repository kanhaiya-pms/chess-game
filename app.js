const http = require("http");
const express = require("express");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const PORT = 8080;

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (uniqsocket) => {
  console.log("someone connected!", uniqsocket.id);

  if (!players.white) {
    players.white = uniqsocket.id;
    uniqsocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqsocket.id;
    uniqsocket.emit("playerRole", "b");
  } else {
    players.black = uniqsocket.id;
    uniqsocket.emit("spectatorRole");
  }

  console.log("connected players ", players);

  uniqsocket.on("disconnect", () => {
    if (uniqsocket.id == players.white) {
      delete players.white;
    } else if (uniqsocket.id == players.black) {
      delete players.black;
    }
    console.log(players);
  });

  uniqsocket.on("move", (move) => {
    console.log(move);
    try {
      if (chess.turn() === "w" && uniqsocket.id !== players.white) return;
      if (chess.turn() === "b" && uniqsocket.id !== players.black) return;


      const result = chess.move(move);
      console.log(result);

        if (result) {
            currentPlayer = chess.turn()
            io.emit("move",move);
            io.emit("boardState", chess.fen());
        } else {
            console.log("Invalid move : ", move);
            uniqsocket.emit("invalidMove",move)
        }


    } catch (error) {
        console.log(error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`server is running on  http://localhost:${PORT}`);
});
