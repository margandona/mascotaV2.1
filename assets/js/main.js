// assets/js/main.js

// Inicializar el juego cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar el jugador
    window.player = new Player();

    // Cargar eventos
    setupEventListeners();
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
    player.buyPet(type);
}

// Función para reiniciar el juego
function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
        player.resetGame();
    }
}
