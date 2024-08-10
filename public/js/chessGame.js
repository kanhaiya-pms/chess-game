const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let draggedSquare = null;
let playerRole = null;

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♟︎",
    q: "♕",
    r: "♖",
    b: "♗",
    n: "♘",
    p: "♙",
    k: "♚",
    K: "♚",
    Q: "♛",
    R: "♜",
    B: "♝",
    N: "♞",
  };

  return unicodePieces[piece.type] || "";
};

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squerIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squerIndex) % 2 == 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squerIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole == square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squerIndex };
            e.dataTransfer.setData("text/plane", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handelMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};


// renderBoard();

const handelMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});
socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});
socket.on("boardState", (fen) => {
  chess.load(fen);
  console.log(fen);
  renderBoard();
});
socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});
