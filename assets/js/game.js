let battleStarted = false;

document.addEventListener("DOMContentLoaded", function () {
    window.player = new Player();

    // Evento para cerrar el modal y otorgar recompensas
    $('#closeMissionModal').on('click', function () {
        player.ghostPetz[player.currentPetIndex].completeMission();
        $('#minigameModal').modal('hide');
    });

    const gameArea = document.getElementById("game-area");

    // Crear NPCs
    const npc1 = createNPC('npc1');
    const npc2 = createNPC('npc2', true); // true para indicar que es el NPC enemigo
    gameArea.appendChild(npc1);
    gameArea.appendChild(npc2);

    // Definir nodos de patrullaje (posiciones predefinidas) para NPC1
    const patrolNodes = [
        { x: 50, y: 50 },
        { x: 500, y: 50 },
        { x: 500, y: 350 },
        { x: 50, y: 350 }
    ];

    // Índice del nodo actual en la patrulla
    let currentNodeIndex = 0;

    // Función para mover el NPC1 al siguiente nodo de patrullaje
    function moveToNextNode() {
        const targetNode = patrolNodes[currentNodeIndex];
        npc1.style.top = `${targetNode.y}px`;
        npc1.style.left = `${targetNode.x}px`;
        currentNodeIndex = (currentNodeIndex + 1) % patrolNodes.length;
        setTimeout(moveToNextNode, 3000);
    }

    // Empezar el patrullaje
    moveToNextNode();

    // Función para mover el NPC2 aleatoriamente
    function moveRandomly(npc) {
        const targetX = Math.random() * (gameArea.clientWidth - npc.clientWidth);
        const targetY = Math.random() * (gameArea.clientHeight - npc.clientHeight);
        npc.style.top = `${targetY}px`;
        npc.style.left = `${targetX}px`;
        setTimeout(() => moveRandomly(npc), 3000);
    }

    // Empezar el movimiento aleatorio
    moveRandomly(npc2);

    // Comprobar colisiones entre NPCs
    setInterval(checkCollision, 100);

    // Función para comprobar colisiones
    function checkCollision() {
        const rect1 = npc1.getBoundingClientRect();
        const rect2 = npc2.getBoundingClientRect();

        const buffer = 20; // Ampliar área de colisión

        if (
            rect1.left < rect2.right + buffer &&
            rect1.right > rect2.left - buffer &&
            rect1.top < rect2.bottom + buffer &&
            rect1.bottom > rect2.top - buffer
        ) {
            if (!battleStarted) {
                battleStarted = true;
                $('#battleModal').modal('show');
                startBattle();
            }
        }
    }

    // Evento para mostrar el modal al hacer clic en el NPC1
    npc1.addEventListener('click', function () {
        $('#npcModal').modal('show');
    });

    // Evento para mostrar el modal al hacer clic en el NPC2
    npc2.addEventListener('click', function () {
        $('#npcModal').modal('show');
    });

    // Interacción con los NPCs al hacer clic
    function handleNPCClick(npc, npcName) {
        npc.addEventListener("click", function () {
            $('#interactionModal').modal('show');
            $('.modal-body').text(`Has interactuado con ${npcName} en la posición (${npc.style.left}, ${npc.style.top})`);
        });
    }

    handleNPCClick(npc1, 'NPC1');
    handleNPCClick(npc2, 'NPC2');

    // Evento para iniciar el minijuego "Caza de Fantasmas"
    $('#missions-buttons').on('click', 'button', function () {
        const mission = $(this).data('mission');
        if (mission === 'rescatarCriaturas') {
            $('#minigameModal').modal('show');
        }
    });

    // Evento para iniciar el minijuego cuando se presiona "Comenzar"
    $('#startMinigame').on('click', function () {
        startGhostHuntGame();
    });
});

// Crear un NPC
function createNPC(id, isEnemy = false) {
    const npc = document.createElement("div");
    npc.classList.add("npc");
    npc.id = id;
    if (isEnemy) {
        npc.classList.add("npc-enemy"); // Clase para el NPC enemigo
    } else {
        npc.classList.add("npc-player"); // Clase para el NPC del jugador
    }
    return npc;
}

// Función para seleccionar una mascota
function selectPet(type) {
    if (player.ghostPetz.length > 0) {
        player.showMsg('Ya tienes un GhostPet. Usa la opción de comprar para adquirir más.', 'warning');
        return;
    }
    const ghostPet = new GhostPet(type);
    player.addGhostPet(ghostPet);
    player.switchPet(player.ghostPetz.length - 1);
    $('#main-image').attr('src', ghostPet.getImagePath());
    $('#pet-status-card, #activities-card, #missions-card, #inventory-card, #coins-card, #explore-card, #switch-pet-card, #buy-pet-card, #missions-history-card, #options-card').show();
}

// Función para realizar una actividad
function performActivity(activity) {
    player.ghostPetz[player.currentPetIndex].performActivity(activity);
}

// Función para iniciar una misión
function startMission(mission) {
    player.ghostPetz[player.currentPetIndex].startMission(mission);
}

// Función para explorar un área
function exploreArea(area) {
    player.ghostPetz[player.currentPetIndex].exploreArea(area);
}

// Función para comprar una mascota o artículo
function buyPet(type) {
    player.buyPet(type);
}

// Función para reiniciar el juego
function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
        player.resetGame();
    }
}

// Función para iniciar la batalla
function startBattle() {
    const npc1Stats = calculateNPCStats();
    const npc2Stats = calculateNPCStats();
    const winner = npc1Stats > npc2Stats ? 'NPC1' : 'NPC2';
    $('#battleResult').text(`${winner} ha ganado la batalla!`);
    player.ghostPetz[player.currentPetIndex].gainXP(20);
    player.updateCoins(10);
    player.addMissionToHistory({ description: `Batalla entre NPCs`, rewards: [`Ganador: ${winner}`] });
    battleStarted = false;
}

function calculateNPCStats() {
    return Math.floor(Math.random() * 100);
}

// Variables globales para el minijuego
let score, targetScore, speed, timeLeft, gameInterval, npcInterval, timerInterval;

// Función para iniciar el minijuego "Caza de Fantasmas"
function startGhostHuntGame() {
    const gameArea = document.getElementById("minigame-container");
    gameArea.innerHTML = `
        <div id="ghostHuntGame"></div>
        <div class="minigame-info">
            <p id="scoreCounter">Fantasmas atrapados: 0</p>
            <p id="targetCounter">Meta: 10</p>
            <p id="timer">Tiempo restante: 30s</p>
        </div>
    `;

    const ghostHuntGame = document.getElementById("ghostHuntGame");
    ghostHuntGame.style.width = '100%';
    ghostHuntGame.style.height = '400px';
    ghostHuntGame.style.backgroundColor = '#000';

    score = 0;
    targetScore = 10;
    speed = 1000;
    timeLeft = 30;

    gameInterval = setInterval(spawnGhost, speed);
    npcInterval = null;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `Tiempo restante: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGhostHuntGame();
        }
    }, 1000);
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
        speed *= 0.9;
        clearInterval(gameInterval);
        gameInterval = setInterval(spawnGhost, speed);
    }
    document.getElementById('targetCounter').innerText = `Meta: ${targetScore}`;
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

    setTimeout(() => {
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
        npc.remove();
    }, 1000);
}

function endGhostHuntGame() {
    clearInterval(gameInterval);
    clearInterval(npcInterval);
    clearInterval(timerInterval);
    alert(`¡Juego terminado! Has atrapado ${score} fantasmas.`);
    $('#minigameModal').modal('hide');
    player.addMissionToHistory({ description: `Caza de Fantasmas`, rewards: [`Fantasmas atrapados: ${score}`, `Premio: ${score * 10} monedas`] });
    player.updateCoins(score * 10);
}
