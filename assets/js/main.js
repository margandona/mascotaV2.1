document.addEventListener("DOMContentLoaded", function () {
    // Inicializar el jugador
    window.player = new Player();
    
    // Cargar el progreso del jugador si existe
    player.loadProgress();

    // Cargar eventos
    setupEventListeners();

    // Inicializar intervalos de recarga de energía
    setInterval(() => {
        player.ghostPetz.forEach(pet => {
            if (pet.energy < 100) {
                pet.energy = Math.min(pet.energy + 1, 100);
                pet.updateStats();
            }
        });
    }, 60000); // Recargar 1 punto de energía cada 60 segundos

    // Mostrar el estado inicial del juego
    showInitialState();
});


// Función para configurar los eventos
function setupEventListeners() {
    // Evento para cerrar el modal y otorgar recompensas
    $('#closeMissionModal').on('click', function () {
        player.ghostPetz[player.currentPetIndex].completeMission();
        $('#minigameModal').modal('hide');
    });

    // Evento para seleccionar una mascota
    $('#select-pet-buttons').on('click', 'button', function () {
        const petType = $(this).data('pet-type');
        selectPet(petType);
    });

    // Evento para realizar actividades
    $('#activities-buttons').on('click', 'button', function () {
        const activity = $(this).data('activity');
        performActivity(activity);
    });

    // Evento para iniciar misiones
    $('#missions-buttons').on('click', 'button', function () {
        const mission = $(this).data('mission');
        startMission(mission);
    });

    // Evento para explorar áreas
    $('#explore-buttons').on('click', 'button', function () {
        const area = $(this).data('area');
        exploreArea(area);
    });

    // Evento para comprar una mascota
    $('#buy-pet-buttons').on('click', 'button', function () {
        const petType = $(this).data('pet-type');
        buyPet(petType);
    });

    // Evento para reiniciar el juego
    $('#reset-game-button').on('click', function () {
        resetGame();
    });

    // Evento para iniciar un mini-juego
    $('#start-minigame-button').on('click', function () {
        startMinigame();
    });
}

// Función para seleccionar una mascota
function selectPet(type) {
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

// Función para comprar una mascota
function buyPet(type) {
    player.buyPetOrItem(type);
}

// Función para reiniciar el juego
function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
        player.resetGame();
    }
}

// Función para iniciar un mini-juego
function startMinigame() {
    $('#minigameModal').modal('show');
    // Lógica adicional para iniciar el mini-juego
}

// Función para mostrar el estado inicial del juego
function showInitialState() {
    if (player.ghostPetz.length > 0) {
        player.switchPet(player.currentPetIndex);
        $('#main-image').attr('src', player.ghostPetz[player.currentPetIndex].getImagePath());
        $('#pet-status-card, #activities-card, #missions-card, #inventory-card, #coins-card, #explore-card, #switch-pet-card, #buy-pet-card, #missions-history-card, #options-card').show();
    } else {
        $('#collapseSelection').collapse('show');
    }
}
