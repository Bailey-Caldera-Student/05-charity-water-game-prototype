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
const objects = [];

// Show one screen at a time.
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// Reset the game state and return to the gameplay view.
function resetGame() {
  score = 0;
  progress = 0;
  timer = 60;
  message.textContent = 'Keep drilling to reach clean water.';
  updateScore();
  updateTimer();
  clearObjects();
  showScreen('game');
}

// Start the actual gameplay.
function startGame() {
  resetGame();
  startTimer();
  startSpawning();
}

// End the game and show the win screen.
function endGame() {
  clearInterval(timerInterval);
  clearInterval(spawnInterval);
  cancelAnimationFrame(objectAnimationFrame);
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
  if (!playField) {
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
  if (!isDragging || !playField) {
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
}

function createObject() {
  const objectTypes = [
    { name: 'water', symbol: '💧', points: 10 },
    { name: 'jerry-can', symbol: '🫙', points: 20 },
    { name: 'boulder', symbol: '🪨', points: -20 }
  ];
  const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
  const item = document.createElement('div');
  item.className = `game-object ${type.name}`;
  item.textContent = type.symbol;
  item.dataset.points = type.points;

  const x = Math.random() * (playField.clientWidth - 40);
  item.style.left = `${x}px`;
  item.style.top = '0px';
  playField.appendChild(item);
  objects.push(item);
}

function moveObjects() {
  objects.forEach(item => {
    const top = Number(item.style.top.replace('px', ''));
    const newTop = top + 2;
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

function checkCollisions() {
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
    createObject();
  }, 700);
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
