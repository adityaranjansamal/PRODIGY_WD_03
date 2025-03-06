document.addEventListener("DOMContentLoaded", function () {
  const mainLoader = document.getElementById("mainLoader");
  const progressBar = document.getElementById("progress-bar");

  // Animate the progress bar
  setTimeout(() => {
    progressBar.style.width = "100%";
  }, 100); // Delay to ensure animation starts

  // Hide loader and show game content after 1.5 seconds
  setTimeout(() => {
    mainLoader.style.display = "none";
  }, 1580);
});

//Dark Mode Toggle with Persistent State
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("darkMode", "disabled");
  }
});

//Year update for footer
document.getElementById("year").textContent = new Date().getFullYear();

// Game Elementscurrent
const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const firstPlayerToggle = document.getElementById("firstPlayerToggle");
const firstPlayerLabel = document.getElementById("firstPlayerLabel");
const pillSliders = document.getElementById("pillSlider");
const gameHeading = document.getElementById("game-title");

// First Move Slider Logic - AI Plays Immediately When Switched
firstPlayerToggle.addEventListener("change", () => {
  firstPlayerLabel.textContent = firstPlayerToggle.checked ? "O" : "X";

  // If AI is active and "O" is selected, make AI move instantly
  if (aiMode && firstPlayerToggle.checked && currentPlayer === "X") {
    setTimeout(() => {
      let bestMove = getBestMove(); // AI picks best move
      makeMove(bestMove, "O");
      currentPlayer = "X"; // Switch back to player
      firstPlayerToggle.checked = false; // Switch back to player
      firstPlayerLabel.textContent = "X"; // Switch back to player
    }, 500);
  }
});

let currentPlayer, gameActive, boardState, aiMode, aiDifficulty;
let scores = { X: 0, O: 0 };

// Initialize Game
function startGame(mode, difficulty = "hard") {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");

  aiMode = mode === "ai";
  aiDifficulty = difficulty; // "easy" or "hard"
  currentPlayer = firstPlayerToggle.checked ? "O" : "X";
  boardState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  pillSliders.style.display = aiMode ? "flex" : "none"; // Hides the Slider on 2 Player Mode

  gameHeading.innerHTML = aiMode
    ? "🎮 Tic-Tac-Toe (Player vs AI)"
    : "🎮 Tic-Tac-Toe (2 Player)";

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("winning", "x", "o");
  });
}

// Handle Clicks
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!gameActive || cell.textContent) return;

    makeMove(cell.dataset.index, currentPlayer);

    if (gameActive && aiMode && currentPlayer === "O") {
      setTimeout(() => {
        let bestMove = getBestMove();
        makeMove(bestMove, "O");
      }, 500);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const aiToggle = document.getElementById("ai-toggle");
  const aiDropdown = document.getElementById("ai-options");

  aiToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    aiDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdown")) {
      aiDropdown.classList.remove("show");
    }
  });
});

// Make Move
function makeMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());

  if (checkWin()) {
    scores[player]++;
    updateScore();
    return;
  }

  if (!boardState.includes("")) {
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

// Check Winner
function checkWin() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winPatterns) {
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      cells[a].classList.add("winning");
      cells[b].classList.add("winning");
      cells[c].classList.add("winning");
      showWinOverlay(boardState[a]); // Show win message
      gameActive = false;
      return true;
    }
  }
  return false;
}

// Show Win Overlay
function showWinOverlay(winner) {
  const overlay = document.getElementById("win-overlay");
  const message = document.getElementById("win-message");

  message.textContent = `${winner} Wins!`; // Set winner text
  overlay.classList.remove("hidden"); // Make it visible

  // Apply animation
  overlay.style.opacity = "1";
  overlay.style.animation = "bounce 0.6s ease-in-out";

  // Fade out and hide after 2 seconds
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.classList.add("hidden"), 500); // Ensure it's removed
  }, 2000);
}

// Update Score
function updateScore() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
}

// Reset Board
function resetBoard() {
  boardState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("winning", "x", "o");
  });
}

// Return to Main Menu
function backToMenu() {
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById("main-menu").classList.remove("hidden");
}

// AI Logic: Choose move based on difficulty
function getBestMove() {
  return aiDifficulty === "easy" ? getSmartRandomMove() : getHardMove();
}

//If winning move is available, play it. Otherwise, play a random move (Smart Easy Mode).
function getSmartRandomMove() {
  // Check if AI can win in the next move
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === "") {
      boardState[i] = "O";
      if (checkWinner() === "O") {
        boardState[i] = ""; // Reset move after checking
        return i; // Play winning move
      }
      boardState[i] = ""; // Reset move
    }
  }

  // If no winning move, pick a random available move
  return getEasyMove();
}

// Easy Mode AI - Random move
function getEasyMove() {
  let availableMoves = boardState
    .map((cell, index) => (cell === "" ? index : null))
    .filter((index) => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// AI Logic (Minimax Algorithm)
function getHardMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === "") {
      boardState[i] = "O";
      let score = minimax(boardState, 0, false);
      boardState[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

const scoresAI = {
  X: -1,
  O: 1,
  tie: 0,
};

function minimax(board, depth, isMaximizing) {
  let winner = checkWinner();
  if (winner !== null) return scoresAI[winner];

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Check Winner for AI
function checkWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winPatterns) {
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      return boardState[a];
    }
  }

  return boardState.includes("") ? null : "tie";
}
