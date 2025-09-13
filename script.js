const boardSize = 600;
const cellSize = boardSize / 10;
let players = [];
let currentPlayer = 0;
let finishedPlayers = [];
let mode = "";

const snakes = {
  38: 20, 45: 7, 51: 10, 65: 54, 91: 73, 97: 61
};

const ladders = {
  42: 60, 5: 58, 14: 49, 64: 83, 75: 94, 53: 72
};

function showNameInputs() {
  mode = document.getElementById("mode").value;
  const inputArea = document.getElementById("name-inputs");
  inputArea.innerHTML = "";

  let num = (mode === "computer") ? 1 : parseInt(mode);
  for (let i = 1; i <= num; i++) {
    const input = document.createElement("input");
    input.placeholder = `Enter name of Player ${i}`;
    input.id = `name${i}`;
    inputArea.appendChild(input);
  }
}

function startGame() {
  players = [];
  currentPlayer = 0;
  finishedPlayers = [];

  const board = document.getElementById("board");
  board.innerHTML = "";

  const colors = ["red", "blue", "green", "yellow"];
  let numPlayers = mode === "computer" ? 1 : parseInt(mode);

  for (let i = 0; i < numPlayers; i++) {
    let name = document.getElementById(`name${i + 1}`).value || `Player ${i + 1}`;
    const token = document.createElement("div");
    token.className = "token";
    token.style.backgroundColor = colors[i];
    board.appendChild(token);
    players.push({ position: 1, token, name, finished: false });
  }

  if (mode === "computer") {
    const compToken = document.createElement("div");
    compToken.className = "token";
    compToken.style.backgroundColor = "orange";
    board.appendChild(compToken);
    players.push({ position: 1, token: compToken, name: "Computer", finished: false, isComputer: true });
  }

  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  updateTokens();
  document.getElementById("status").textContent = `${players[currentPlayer].name}'s turn`;
  updateRollButton();
}

function rollDice() {
  document.getElementById("dice-sound").cloneNode().play();

  const diceVal = Math.floor(Math.random() * 6) + 1;
  document.getElementById("dice").textContent = `🎲 ${diceVal}`;
  let player = players[currentPlayer];
  if (player.finished) {
    nextPlayer();
    return;
  }
  moveStepByStep(player, diceVal);
}

function moveStepByStep(player, steps) {
  let originalPos = player.position;

  // 🛑 Prevent overshooting 100
  if (player.position + steps > 100) {
    updateTokens();
    setTimeout(nextPlayer, 800);
    return;
  }

  let count = 0;

  function step() {
    if (count < steps) {
      player.position++;
      updateTokens();
      count++;
      setTimeout(step, 300);
    } else {
      if (snakes[player.position]) {
        document.getElementById("snake-sound").cloneNode().play();
        player.position = snakes[player.position];
      } else if (ladders[player.position]) {
        document.getElementById("ladder-sound").cloneNode().play();
        player.position = ladders[player.position];
      }

      updateTokens();

      if (player.position === 100 && !player.finished) {
        player.finished = true;
        finishedPlayers.push(player);

        // End game when only 1 player remains
        if (finishedPlayers.length === players.length - 1) {
          const lastOne = players.find(p => !p.finished);
          if (lastOne) finishedPlayers.push(lastOne);
          showResults();
          return;
        }
      }

      nextPlayer();
    }
  }

  step();
}

function nextPlayer() {
  do {
    currentPlayer = (currentPlayer + 1) % players.length;
  } while (players[currentPlayer].finished);

  const next = players[currentPlayer];
  document.getElementById("status").textContent = `${next.name}'s turn`;
  updateRollButton();

  if (next.isComputer) {
    setTimeout(rollDice, 1000);
  }
}

function updateRollButton() {
  const btn = document.getElementById("roll-btn");
  btn.style.display = players[currentPlayer].isComputer ? "none" : "inline-block";
}

function updateTokens() {
  players.forEach((p, index) => {
    const pos = p.position;
    const row = Math.floor((pos - 1) / 10);
    const col = (row % 2 === 0)
      ? (pos - 1) % 10
      : 9 - ((pos - 1) % 10);

    const x = col * cellSize;
    const y = (9 - row) * cellSize;

    p.token.style.left = `${x + (index % 2) * 10}px`;
    p.token.style.top = `${y + Math.floor(index / 2) * 10}px`;
  });
}

function showResults() {
  document.getElementById("game").style.display = "none";
  document.getElementById("result-screen").style.display = "flex";
  document.getElementById("win-sound").play();

  const rankBox = document.getElementById("ranking");
  rankBox.innerHTML = "";

  finishedPlayers.forEach((p, i) => {
    rankBox.innerHTML += `
      <div class="rank-box">
        <h3>🥇 Rank ${i + 1}</h3>
        <p>${p.name}</p>
      </div>`;
  });
}

function resetToStart() {
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("setup").style.display = "block";
  document.getElementById("mode").value = "";
  document.getElementById("name-inputs").innerHTML = "";
  document.getElementById("dice").textContent = "🎲";
}