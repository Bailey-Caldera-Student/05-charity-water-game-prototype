const screens = {
  start: document.getElementById('startScreen'),
  howToPlay: document.getElementById('howToPlayScreen'),
  game: document.getElementById('gameScreen'),
  win: document.getElementById('winScreen')
};

const startBtn = document.getElementById('startBtn');
const beginGameBtn = document.getElementById('beginGameBtn');
const againBtn = document.getElementById('playAgainBtn');
const scoreValue = document.getElementById('scoreValue');
const meterFill = document.getElementById('meterFill');
const message = document.getElementById('message');
const finalScore = document.getElementById('finalScore');
const timerValue = document.getElementById('timerValue');
const playField = document.querySelector('.play-field');
const drillPlayer = document.getElementById('drillPlayer');

let score = 0;
let progress = 0;
let timer = 60;
let isDragging = false;
let dragOffset = 0;
let timerInterval = null;
let spawnInterval = null;
let objectAnimationFrame = null;
let gameActive = false;
let popupTimeouts = [];
const objects = [];

// Show one screen at a time.
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// Reset the game state and return to the gameplay view.
function resetGame() {
  clearGameLoop();
  score = 0;
  progress = 0;
  timer = 60;
  gameActive = false;
  message.textContent = 'Keep drilling to reach clean water.';
  updateScore();
  updateTimer();
  clearObjects();
  showScreen('game');
}

// Start the actual gameplay.
function startGame() {
  resetGame();
  gameActive = true;
  startTimer();
  startSpawning();
}

// End the game and show the win screen.
function clearGameLoop() {
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  cancelAnimationFrame(objectAnimationFrame);
  popupTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  popupTimeouts = [];
}

function endGame() {
  gameActive = false;
  clearGameLoop();
  finalScore.textContent = score;
  showScreen('win');
}

// Update the score and the progress bar.
function updateScore() {
  scoreValue.textContent = score;
  finalScore.textContent = score;
  meterFill.style.width = `${Math.min(progress, 100)}%`;
}

function updateTimer() {
  timerValue.textContent = timer;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer -= 1;
    updateTimer();

    if (timer <= 0) {
      clearInterval(timerInterval);
      message.textContent = 'Time is up! The drill reached the water.';
      endGame();
    }
  }, 1000);
}

function clampPosition(x) {
  const maxX = playField.clientWidth - drillPlayer.offsetWidth;
  return Math.max(0, Math.min(x, maxX));
}

function updateDrillPosition(x) {
  const left = clampPosition(x);
  drillPlayer.style.left = `${left}px`;
}

function startDragging(event) {
  if (!playField || !gameActive) {
    return;
  }

  isDragging = true;
  const rect = playField.getBoundingClientRect();
  const pointerX = event.clientX || event.touches[0].clientX;
  const drillLeft = drillPlayer.offsetLeft;
  dragOffset = pointerX - rect.left - drillLeft;
  playField.setPointerCapture(event.pointerId);
}

function dragPlayer(event) {
  if (!isDragging || !playField || !gameActive) {
    return;
  }

  const rect = playField.getBoundingClientRect();
  const pointerX = event.clientX || event.touches[0].clientX;
  const newLeft = pointerX - rect.left - dragOffset;
  updateDrillPosition(newLeft);
}

function stopDragging(event) {
  if (!isDragging) {
    return;
  }

  isDragging = false;
  if (event?.pointerId !== undefined) {
    playField.releasePointerCapture(event.pointerId);
  }
}

function clearObjects() {
  objects.splice(0, objects.length);
  playField.querySelectorAll('.game-object').forEach(item => item.remove());
  playField.querySelectorAll('.floating-score').forEach(item => item.remove());
}

function createObject() {
  const objectTypes = [
    { name: 'water', symbol: '💧', points: 10, size: 'medium', speed: 2.5 },
    { name: 'jerry-can', symbol: '🫙', points: 20, size: 'small', speed: 2 },
    { name: 'boulder', symbol: '🪨', points: -20, size: 'large', speed: 1.5 }
  ];
  const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
  const item = document.createElement('div');
  item.className = `game-object ${type.name} ${type.size}`;
  item.textContent = type.symbol;
  item.dataset.points = type.points;
  item.dataset.speed = type.speed;

  const x = Math.random() * (playField.clientWidth - 60);
  item.style.left = `${x}px`;
  item.style.top = '0px';
  playField.appendChild(item);
  objects.push(item);
}

function moveObjects() {
  if (!gameActive) {
    return;
  }

  objects.forEach(item => {
    const top = Number(item.style.top.replace('px', ''));
    const speed = Number(item.dataset.speed || 2);
    const newTop = top + speed;
    item.style.top = `${newTop}px`;

    if (newTop > playField.clientHeight - 70) {
      item.remove();
      const index = objects.indexOf(item);
      if (index > -1) {
        objects.splice(index, 1);
      }
    }
  });

  checkCollisions();
  objectAnimationFrame = requestAnimationFrame(moveObjects);
}

function showFloatingText(x, y, points) {
  const popup = document.createElement('div');
  const fieldRect = playField.getBoundingClientRect();
  popup.className = 'floating-score';
  popup.textContent = points > 0 ? `+${points}` : `${points}`;
  popup.style.left = `${Math.max(0, x - fieldRect.left)}px`;
  popup.style.top = `${Math.max(0, y - fieldRect.top)}px`;
  playField.appendChild(popup);

  const timeoutId = setTimeout(() => {
    popup.remove();
  }, 700);
  popupTimeouts.push(timeoutId);
}

function checkCollisions() {
  if (!gameActive) {
    return;
  }

  const drillRect = drillPlayer.getBoundingClientRect();

  objects.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const hit = (
      itemRect.left < drillRect.right &&
      itemRect.right > drillRect.left &&
      itemRect.top < drillRect.bottom &&
      itemRect.bottom > drillRect.top
    );

    if (hit) {
      const points = Number(item.dataset.points);
      score = Math.max(0, score + points);
      updateScore();
      showFloatingText(itemRect.left, itemRect.top, points);
      item.remove();
      const index = objects.indexOf(item);
      if (index > -1) {
        objects.splice(index, 1);
      }
    }
  });
}

function startSpawning() {
  clearInterval(spawnInterval);
  spawnInterval = setInterval(() => {
    if (gameActive) {
      createObject();
    }
  }, Math.random() * 800 + 400);
  cancelAnimationFrame(objectAnimationFrame);
  objectAnimationFrame = requestAnimationFrame(moveObjects);
}

startBtn.addEventListener('click', () => {
  showScreen('howToPlay');
});

beginGameBtn.addEventListener('click', () => {
  startGame();
});

againBtn.addEventListener('click', () => {
  startGame();
});

playField.addEventListener('pointerdown', startDragging);
playField.addEventListener('pointermove', dragPlayer);
playField.addEventListener('pointerup', stopDragging);
playField.addEventListener('pointercancel', stopDragging);

updateScore();
showScreen('start');
