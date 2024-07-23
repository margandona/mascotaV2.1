$(document).ready(function () {
    window.player = new Player();

    // Evento para cerrar el modal y otorgar recompensas
    $('#closeMissionModal').on('click', function () {
        player.ghostPetz[player.currentPetIndex].completeMission();
        $('#minigameModal').modal('hide');
    });

    const $gameArea = $("#game-area");

    // Crear NPCs
    const $npc1 = createNPC('npc1');
    const $npc2 = createNPC('npc2', true); // true para indicar que es el NPC enemigo
    $gameArea.append($npc1, $npc2);

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
        $npc1.css({ top: `${targetNode.y}px`, left: `${targetNode.x}px` });
        currentNodeIndex = (currentNodeIndex + 1) % patrolNodes.length;
        setTimeout(moveToNextNode, 3000);
    }

    // Empezar el patrullaje
    moveToNextNode();

    // Función para mover el NPC2 aleatoriamente
    function moveRandomly($npc) {
        const targetX = Math.random() * ($gameArea.width() - $npc.width());
        const targetY = Math.random() * ($gameArea.height() - $npc.height());
        $npc.css({ top: `${targetY}px`, left: `${targetX}px` });
        setTimeout(() => moveRandomly($npc), 3000);
    }

    // Empezar el movimiento aleatorio
    moveRandomly($npc2);

    let battleOngoing = false; // Bandera para controlar la colisión

    // Comprobar colisiones entre NPCs
    setInterval(checkCollision, 100);

    // Función para comprobar colisiones
    function checkCollision() {
        const rect1 = $npc1[0].getBoundingClientRect();
        const rect2 = $npc2[0].getBoundingClientRect();

        const buffer = 20; // Ampliar área de colisión

        if (
            rect1.left < rect2.right + buffer &&
            rect1.right > rect2.left - buffer &&
            rect1.top < rect2.bottom + buffer &&
            rect1.bottom > rect2.top - buffer &&
            !battleOngoing
        ) {
            battleOngoing = true;
            $('#battleModal').modal('show');
        }
    }

    // Evento para procesar la batalla al cerrar el modal
    $('#battleModal').on('hidden.bs.modal', function () {
        startBattle();
        battleOngoing = false;
    });

    // Evento para mostrar el modal al hacer clic en el NPC1
    $npc1.on('click', function () {
        $('#npcModal').modal('show');
    });

    // Evento para mostrar el modal al hacer clic en el NPC2
    $npc2.on('click', function () {
        $('#npcModal').modal('show');
    });

    // Interacción con los NPCs al hacer clic
    function handleNPCClick($npc, npcName) {
        $npc.on("click", function () {
            $('#interactionModal').modal('show');
            $('.modal-body').text(`Has interactuado con ${npcName} en la posición (${$npc.css('left')}, ${$npc.css('top')})`);
        });
    }

    handleNPCClick($npc1, 'NPC1');
    handleNPCClick($npc2, 'NPC2');
});

// Crear un NPC
function createNPC(id, isEnemy = false) {
    const $npc = $("<div></div>").addClass("npc").attr("id", id);
    if (isEnemy) {
        $npc.addClass("npc-enemy"); // Clase para el NPC enemigo
    } else {
        $npc.addClass("npc-player"); // Clase para el NPC del jugador
    }
    return $npc;
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
function buyPetOrItem(type, isItem = false) {
    player.buyPetOrItem(type, isItem);
}

// Función para reiniciar el juego
function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
        player.resetGame();
    }
}

// Función para iniciar la batalla
function startBattle() {
    // Lógica de batalla entre los NPCs
    const npc1Stats = calculateNPCStats();
    const npc2Stats = calculateNPCStats();

    // Determinar el ganador
    const winner = npc1Stats > npc2Stats ? 'NPC1' : 'NPC2';

    // Mostrar el resultado
    $('#battleResult').text(`${winner} ha ganado la batalla!`);
    player.ghostPetz[player.currentPetIndex].gainXP(20);
    player.updateCoins(10);
    player.addMissionToHistory({ description: `Batalla entre NPCs`, rewards: [`Ganador: ${winner}`] });
}

function calculateNPCStats() {
    return Math.floor(Math.random() * 100);
}
