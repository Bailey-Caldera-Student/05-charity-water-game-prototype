const screens = {
  start: document.getElementById('startScreen'),
  howToPlay: document.getElementById('howToPlayScreen'),
  game: document.getElementById('gameScreen'),
  win: document.getElementById('winScreen')
};

const startBtn = document.getElementById('startBtn');
const beginGameBtn = document.getElementById('beginGameBtn');
const drillBtn = document.getElementById('drillBtn');
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
  showScreen('game');
}

// Start the actual gameplay.
function startGame() {
  resetGame();
  startTimer();
}

// End the game and show the win screen.
function endGame() {
  clearInterval(timerInterval);
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

// Switch to the win screen when the meter reaches the end.
function checkWin() {
  if (progress >= 100) {
    message.textContent = 'You reached drinkable water!';
    endGame();
  }
}

startBtn.addEventListener('click', () => {
  showScreen('howToPlay');
});

beginGameBtn.addEventListener('click', () => {
  startGame();
});

drillBtn.addEventListener('click', () => {
  progress += 20;
  score += 10;
  updateScore();

  if (progress >= 100) {
    message.textContent = 'Great job! Clean water is flowing.';
    checkWin();
  } else if (progress >= 60) {
    message.textContent = 'The water is getting clearer!';
  } else if (progress >= 40) {
    message.textContent = 'You are getting close to the water table.';
  } else {
    message.textContent = 'Keep drilling!';
  }
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
