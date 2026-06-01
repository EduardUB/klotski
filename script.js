const board = document.querySelector("#board");
const moveCount = document.querySelector("#moveCount");
const bestScore = document.querySelector("#bestScore");
const hint = document.querySelector("#hint");
const toast = document.querySelector("#toast");
const resetButton = document.querySelector("#resetButton");
const undoButton = document.querySelector("#undoButton");
const dpadButtons = document.querySelectorAll("[data-dir]");

const COLS = 4;
const ROWS = 5;
const WIN = { x: 1, y: 3 };
const BEST_KEY = "klotski-best-score";

const startPieces = [
  { id: "cao", label: "Cao Cao", kind: "hero", x: 1, y: 0, w: 2, h: 2 },
  { id: "zhang", label: "Zhang", kind: "vertical", x: 0, y: 0, w: 1, h: 2 },
  { id: "zhao", label: "Zhao", kind: "vertical", x: 3, y: 0, w: 1, h: 2 },
  { id: "ma", label: "Ma", kind: "vertical", x: 0, y: 2, w: 1, h: 2 },
  { id: "huang", label: "Huang", kind: "vertical", x: 3, y: 2, w: 1, h: 2 },
  { id: "guan", label: "Guan Yu", kind: "horizontal", x: 1, y: 3, w: 2, h: 1 },
  { id: "s1", label: "Soldado", kind: "small", x: 1, y: 2, w: 1, h: 1 },
  { id: "s2", label: "Soldado", kind: "small", x: 2, y: 2, w: 1, h: 1 },
  { id: "s3", label: "Soldado", kind: "small", x: 0, y: 4, w: 1, h: 1 },
  { id: "s4", label: "Soldado", kind: "small", x: 3, y: 4, w: 1, h: 1 },
];

let pieces = clonePieces(startPieces);
let selectedId = "cao";
let moves = 0;
let history = [];
let pointerStart = null;
let won = false;
let toastTimer = null;

function clonePieces(source) {
  return source.map((piece) => ({ ...piece }));
}

function pieceById(id) {
  return pieces.find((piece) => piece.id === id);
}

function render() {
  board.innerHTML = "";

  pieces.forEach((piece) => {
    const el = document.createElement("button");
    el.className = `piece${piece.id === selectedId ? " selected" : ""}`;
    el.type = "button";
    el.dataset.id = piece.id;
    el.dataset.kind = piece.kind;
    el.style.left = `${(piece.x / COLS) * 100}%`;
    el.style.top = `${(piece.y / ROWS) * 100}%`;
    el.style.width = `${(piece.w / COLS) * 100}%`;
    el.style.height = `${(piece.h / ROWS) * 100}%`;
    el.setAttribute("aria-pressed", String(piece.id === selectedId));
    el.setAttribute("aria-label", `${piece.label}, ${piece.w} por ${piece.h}`);
    el.title = piece.label;
    el.addEventListener("click", () => selectPiece(piece.id));
    board.appendChild(el);
  });

  moveCount.textContent = moves;
  bestScore.textContent = localStorage.getItem(BEST_KEY) || "--";
  undoButton.disabled = history.length === 0 || won;
}

function selectPiece(id) {
  selectedId = id;
  hint.textContent = `Seleccionada: ${pieceById(id).label}. Desliza o usa las flechas.`;
  render();
}

function occupiedBy(piece, x, y) {
  return x >= piece.x && x < piece.x + piece.w && y >= piece.y && y < piece.y + piece.h;
}

function canMove(piece, dx, dy) {
  const next = {
    x: piece.x + dx,
    y: piece.y + dy,
    w: piece.w,
    h: piece.h,
  };

  if (next.x < 0 || next.y < 0 || next.x + next.w > COLS || next.y + next.h > ROWS) {
    return false;
  }

  for (let y = next.y; y < next.y + next.h; y += 1) {
    for (let x = next.x; x < next.x + next.w; x += 1) {
      const blocked = pieces.some((other) => other.id !== piece.id && occupiedBy(other, x, y));
      if (blocked) {
        return false;
      }
    }
  }

  return true;
}

function moveSelected(direction) {
  if (won || !selectedId) {
    return;
  }

  const piece = pieceById(selectedId);
  const vector = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  }[direction];

  if (!piece || !vector) {
    return;
  }

  const [dx, dy] = vector;

  if (!canMove(piece, dx, dy)) {
    pulseBlocked(piece.id);
    hint.textContent = "Ese movimiento esta bloqueado.";
    return;
  }

  history.push({
    pieces: clonePieces(pieces),
    moves,
    selectedId,
  });

  piece.x += dx;
  piece.y += dy;
  moves += 1;
  hint.textContent = `${piece.label} se ha movido.`;
  checkWin();
  render();
}

function pulseBlocked(id) {
  const el = board.querySelector(`[data-id="${id}"]`);
  if (!el) {
    return;
  }
  el.classList.remove("blocked");
  window.requestAnimationFrame(() => {
    el.classList.add("blocked");
  });
}

function checkWin() {
  const hero = pieceById("cao");
  if (hero.x === WIN.x && hero.y === WIN.y) {
    won = true;
    const best = Number(localStorage.getItem(BEST_KEY));
    if (!best || moves < best) {
      localStorage.setItem(BEST_KEY, String(moves));
    }
    showToast(`Victoria en ${moves} movimientos`);
    hint.textContent = "Has liberado la pieza roja. Reinicia para jugar otra vez.";
  }
}

function resetGame() {
  pieces = clonePieces(startPieces);
  selectedId = "cao";
  moves = 0;
  history = [];
  won = false;
  hint.textContent = "Toca una pieza para seleccionarla. Desliza sobre el tablero o usa los controles.";
  render();
}

function undo() {
  const last = history.pop();
  if (!last || won) {
    return;
  }
  pieces = clonePieces(last.pieces);
  moves = last.moves;
  selectedId = last.selectedId;
  hint.textContent = "Movimiento deshecho.";
  render();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function directionFromGesture(start, end) {
  const dx = end.clientX - start.clientX;
  const dy = end.clientY - start.clientY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (Math.max(absX, absY) < 24) {
    return null;
  }

  if (absX > absY) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

board.addEventListener("pointerdown", (event) => {
  const pieceEl = event.target.closest(".piece");
  if (pieceEl) {
    selectPiece(pieceEl.dataset.id);
  }
  pointerStart = {
    clientX: event.clientX,
    clientY: event.clientY,
  };
  board.setPointerCapture(event.pointerId);
});

board.addEventListener("pointerup", (event) => {
  if (!pointerStart) {
    return;
  }
  const direction = directionFromGesture(pointerStart, event);
  pointerStart = null;
  if (direction) {
    moveSelected(direction);
  }
});

board.addEventListener("pointercancel", () => {
  pointerStart = null;
});

dpadButtons.forEach((button) => {
  button.addEventListener("click", () => moveSelected(button.dataset.dir));
});

resetButton.addEventListener("click", resetGame);
undoButton.addEventListener("click", undo);

window.addEventListener("keydown", (event) => {
  const keys = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  if (keys[event.key]) {
    event.preventDefault();
    moveSelected(keys[event.key]);
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }
});

render();
