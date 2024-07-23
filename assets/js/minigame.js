// assets/js/minigame.js

let gameInterval;
let npcInterval;
let score = 0;
let targetScore = 10; // Meta inicial
let speed = 1000; // Velocidad inicial de aparición de fantasmas

function startGhostHuntGame() {
    const gameArea = document.getElementById("minigame-container");
    gameArea.innerHTML = `
        <div id="ghostHuntGame"></div>
        <p id="scoreCounter">Fantasmas atrapados: 0</p>
    `;

    const ghostHuntGame = document.getElementById("ghostHuntGame");
    ghostHuntGame.style.width = '100%';
    ghostHuntGame.style.height = '400px';
    ghostHuntGame.style.backgroundColor = '#000';

    score = 0;
    targetScore = 10;
    speed = 1000;

    gameInterval = setInterval(spawnGhost, speed);

    // Detener el juego después de un tiempo
    setTimeout(endGhostHuntGame, 30000); // Juego dura 30 segundos
}

function spawnGhost() {
    const ghostHuntGame = document.getElementById("ghostHuntGame");
    const ghost = document.createElement('div');
    ghost.classList.add('ghost');
    ghost.style.top = Math.random() * (ghostHuntGame.clientHeight - 50) + 'px';
    ghost.style.left = Math.random() * (ghostHuntGame.clientWidth - 50) + 'px';
    ghost.addEventListener('click', () => {
        score++;
        updateScore();
        ghost.remove();
        adjustDifficulty();
        checkForNpc();
    });
    ghostHuntGame.appendChild(ghost);
}

function updateScore() {
    document.getElementById('scoreCounter').innerText = `Fantasmas atrapados: ${score}`;
}

function adjustDifficulty() {
    if (score >= targetScore) {
        targetScore += 10;
        speed *= 0.9; // Aumenta la velocidad un 10%
        clearInterval(gameInterval);
        gameInterval = setInterval(spawnGhost, speed);
    }
}

function checkForNpc() {
    if (score >= targetScore / 2 && !npcInterval) {
        npcInterval = setInterval(spawnNpc, 2000);
    }
}

function spawnNpc() {
    const ghostHuntGame = document.getElementById("ghostHuntGame");
    const npc = document.createElement('div');
    npc.classList.add('npc-ghost');
    npc.style.top = Math.random() * (ghostHuntGame.clientHeight - 50) + 'px';
    npc.style.left = Math.random() * (ghostHuntGame.clientWidth - 50) + 'px';
    ghostHuntGame.appendChild(npc);

    moveNpc(npc);
}

function moveNpc(npc) {
    const ghostHuntGame = document.getElementById("ghostHuntGame");
    const moveInterval = setInterval(() => {
        npc.style.top = Math.random() * (ghostHuntGame.clientHeight - 50) + 'px';
        npc.style.left = Math.random() * (ghostHuntGame.clientWidth - 50) + 'px';
        checkNpcCollision(npc);
    }, 1000);

    setTimeout(() => {
        clearInterval(moveInterval);
        npc.remove();
    }, 10000); // NPC desaparece después de 10 segundos
}

function checkNpcCollision(npc) {
    const ghosts = document.querySelectorAll('.ghost');
    ghosts.forEach(ghost => {
        const ghostRect = ghost.getBoundingClientRect();
        const npcRect = npc.getBoundingClientRect();

        if (
            ghostRect.left < npcRect.right &&
            ghostRect.right > npcRect.left &&
            ghostRect.top < npcRect.bottom &&
            ghostRect.bottom > npcRect.top
        ) {
            ghost.remove();
        }
    });
}

function endGhostHuntGame() {
    clearInterval(gameInterval);
    clearInterval(npcInterval);
    alert(`¡Juego terminado! Has atrapado ${score} fantasmas.`);
    // Otorgar recompensas
    player.coins += score * 10;
    player.ghostPetz[player.currentPetIndex].gainXP(score * 5);
    player.saveProgress();
    $('#minigameModal').modal('hide');
}


    