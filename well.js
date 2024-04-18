const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score-value');
let score = 0;

function createFootball() {
  const football = document.createElement('div');
  football.className = 'football';
  gameContainer.appendChild(football);

  const centerX = window.innerWidth / 2 - 25; // Adjusting for football size
  const centerY = window.innerHeight / 2 - 25; // Adjusting for football size
  football.style.left = centerX + 'px';
  football.style.top = centerY + 'px';

  // Random direction
  const dx = Math.random() * 10 - 5; // Range from -5 to 5
  const dy = Math.random() * 10 - 5; // Range from -5 to 5

  // Move the football
  let posX = centerX;
  let posY = centerY;
  const interval = setInterval(() => {
    posX += dx;
    posY += dy;
    football.style.left = posX + 'px';
    football.style.top = posY + 'px';

    // Check if football is out of bounds
    if (posX < 0 || posX > window.innerWidth || posY < 0 || posY > window.innerHeight) {
      clearInterval(interval);
      gameContainer.removeChild(football);
    }
  }, 100); // Adjust the interval as needed

  // Handle click event
  football.addEventListener('click', () => {
    clearInterval(interval);
    gameContainer.removeChild(football);
    score++;
    scoreDisplay.textContent = score;
  });

  // Remove football after 2 seconds
  setTimeout(() => {
    clearInterval(interval);
    gameContainer.removeChild(football);
  }, 2000);
}

// Spawn 10 footballs initially
for (let i = 0; i < 10; i++) {
  createFootball();
}
