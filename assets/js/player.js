// assets/js/player.js

class Player {
    constructor() {
        this.ghostPetz = [];
        this.currentPetIndex = 0;
        this.inventory = [];
        this.coins = 0;
        this.missionHistory = [];
        this.loadProgress();
        this.updateSelectionVisibility();
    }

    // Añadir un nuevo GhostPet al jugador
    addGhostPet(ghostPet) {
        if (this.ghostPetz.length < 10) {
            this.ghostPetz.push(ghostPet);
            this.updatePetButtons();
            this.showMsg(`Has añadido un nuevo ${ghostPet.type} a tu colección.`, 'info');
            this.saveProgress();
            this.updateSelectionVisibility();
        } else {
            this.showMsg('Ya tienes el máximo de 10 GhostPetz.', 'warning');
        }
    }

    // Cambiar la mascota activa
    switchPet(index) {
        if (index >= 0 && index < this.ghostPetz.length) {
            this.currentPetIndex = index;
            this.ghostPetz[this.currentPetIndex].updateStats();
            $('#main-image').attr('src', this.ghostPetz[this.currentPetIndex].getImagePath());
        }
    }

    // Actualizar los botones de las mascotas
    updatePetButtons() {
        $('#pet-buttons').empty();
        this.ghostPetz.forEach((pet, index) => {
            $('#pet-buttons').append(`<button class="btn btn-secondary mx-2 mb-2" onclick="player.switchPet(${index})"><i class="fas fa-paw"></i> ${pet.type} ${index + 1}</button>`);
        });
    }

    // Actualizar el inventario
    updateInventory() {
        $('#inventory-items').empty();
        this.inventory.forEach((item, index) => {
            $('#inventory-items').append(
                `<div class="inventory-item">
                    ${item.name} - ${item.type} 
                    <button class="btn btn-success btn-sm" onclick="player.useItem(${index})"><i class="fas fa-check"></i> Usar</button>
                    <button class="btn btn-danger btn-sm" onclick="player.sellItem(${index})"><i class="fas fa-trash-alt"></i> Vender</button>
                </div>`
            );
        });
    }

    // Añadir un objeto al inventario
    addItemToInventory(item) {
        this.inventory.push(item);
        this.updateInventory();
        this.showMsg(`¡Has encontrado un objeto: ${item.name}!`, 'success');
        this.saveProgress();
    }

    // Usar un objeto del inventario
    useItem(index) {
        const item = this.inventory[index];
        this.ghostPetz[this.currentPetIndex].applyItem(item);
        this.inventory.splice(index, 1);
        this.updateInventory();
        this.showMsg(`Has usado ${item.name} en tu GhostPet.`, 'info');
        this.saveProgress();
    }

    // Vender un objeto del inventario
    sellItem(index) {
        const item = this.inventory[index];
        this.coins += item.value;
        this.inventory.splice(index, 1);
        this.updateInventory();
        this.updateCoins();
        this.showMsg(`Has vendido ${item.name} por ${item.value} monedas.`, 'info');
        this.saveProgress();
    }

    // Actualizar el conteo de monedas
    updateCoins() {
        $('#coins').text('Monedas: ' + this.coins);
    }

    // Mostrar un mensaje al jugador
    showMsg(message, type) {
        $('#messages').prepend(`<p>${type.toUpperCase()}: ${message}</p>`).hide().fadeIn(1000);
    }

    // Comprar una nueva mascota o artículo
    buyPetOrItem(type, isItem = false) {
        const costs = { 
            fantasma: 100, espectro: 200, wraith: 300, poltergeist: 400, banshee: 500,
            pastel: 50, jarabe: 100, espada: 200 
        };
        const levels = { pastel: 2, jarabe: 3, espada: 5 };

        const cost = costs[type] || 100;
        if (this.coins < cost) {
            this.showMsg('No tienes suficientes monedas para comprar este artículo o GhostPet.', 'danger');
            return;
        }

        if (isItem && this.ghostPetz[this.currentPetIndex].level < levels[type]) {
            this.showMsg(`Necesitas estar al nivel ${levels[type]} para comprar este artículo.`, 'danger');
            return;
        }

        this.coins -= cost;
        this.updateCoins();

        if (isItem) {
            const itemsForSale = {
                pastel: { name: 'Pastel', type: 'comida', value: 20, effect: { health: 10, energy: 10, happiness: 10, xp: 10 } },
                jarabe: { name: 'Jarabe', type: 'medicina', value: 30, effect: { health: 40, xp: 10 } },
                espada: { name: 'Espada', type: 'arma', value: 40, effect: { skills: 15, xp: 20 } }
            };
            const item = itemsForSale[type];
            this.addItemToInventory(item);
            this.showMsg(`Has comprado un ${type} por ${cost} monedas.`, 'success');
        } else {
            const ghostPet = new GhostPet(type);
            this.addGhostPet(ghostPet);
            this.showMsg(`Has comprado un ${type} por ${cost} monedas.`, 'success');
        }

        this.saveProgress();
    }

    // Añadir una misión al historial
    addMissionToHistory(mission) {
        this.missionHistory.push(mission);
        this.updateMissionHistory();
        this.saveProgress();
    }

    // Actualizar el historial de misiones
    updateMissionHistory() {
        $('#mission-history-items').empty();
        this.missionHistory.forEach((mission) => {
            $('#mission-history-items').append(`<div class="mission-history-item">${mission.description} - Recompensas: ${mission.rewards.join(', ')}</div>`);
        });
    }

    // Guardar el progreso del juego en el almacenamiento local
    saveProgress(slot = 1) {
        const progress = {
            ghostPetz: this.ghostPetz.map(pet => pet.serialize()),
            currentPetIndex: this.currentPetIndex,
            inventory: this.inventory,
            coins: this.coins,
            missionHistory: this.missionHistory
        };
        localStorage.setItem(`ghostPetzProgress_${slot}`, JSON.stringify(progress));
    }

    // Cargar el progreso del juego desde el almacenamiento local
    loadProgress(slot = 1) {
        const progress = JSON.parse(localStorage.getItem(`ghostPetzProgress_${slot}`));
        if (progress) {
            this.coins = progress.coins;
            this.inventory = progress.inventory;
            this.missionHistory = progress.missionHistory;
            this.currentPetIndex = progress.currentPetIndex;
            progress.ghostPetz.forEach(petData => {
                const pet = new GhostPet(petData.type);
                pet.deserialize(petData);
                this.ghostPetz.push(pet);
            });
            this.updateCoins();
            this.updateInventory();
            this.updateMissionHistory();
            this.updatePetButtons();
            if (this.ghostPetz.length > 0) {
                this.ghostPetz[this.currentPetIndex].updateStats();
                $('#main-image').attr('src', this.ghostPetz[this.currentPetIndex].getImagePath());
            }
            this.updateSelectionVisibility();
        }
    }

    // Actualizar la visibilidad de la selección de mascotas
    updateSelectionVisibility() {
        if (this.ghostPetz.length === 0) {
            $('#collapseSelection').collapse('show');
        } else {
            $('#collapseSelection').collapse('hide');
        }
    }

    // Reiniciar el juego y eliminar todo el progreso
    resetGame() {
        localStorage.removeItem('ghostPetzProgress');
        this.ghostPetz = [];
        this.currentPetIndex = 0;
        this.inventory = [];
        this.coins = 0;
        this.missionHistory = [];
        $('#main-image').attr('src', 'assets/img/principal.webp');
        $('#pet-status-card, #activities-card, #missions-card, #inventory-card, #coins-card, #explore-card, #switch-pet-card, #buy-pet-card, #missions-history-card, #options-card').hide();
        $('#collapseSelection').collapse('show');
        this.updateInventory();
        this.updateCoins();
        this.updateMissionHistory();
        this.updatePetButtons();
    }
}
