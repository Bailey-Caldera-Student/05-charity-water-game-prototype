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

let score = 0;
let progress = 0;
let timer = 30;

// Show one screen at a time.
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// Reset the game state and return to the gameplay view.
function resetGame() {
  score = 0;
  progress = 0;
  timer = 30;
  message.textContent = 'Keep drilling to reach clean water.';
  updateScore();
  showScreen('game');
}

// Start the actual gameplay.
function startGame() {
  resetGame();
}

// End the game and show the win screen.
function endGame() {
  finalScore.textContent = score;
  showScreen('win');
}

// Update the score and the progress bar.
function updateScore() {
  scoreValue.textContent = score;
  finalScore.textContent = score;
  meterFill.style.width = `${Math.min(progress, 100)}%`;
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

updateScore();
showScreen('start');
