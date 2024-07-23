// assets/js/ghostpet.js

class GhostPet {
    constructor(type) {
        this.type = type;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.health = 100;
        this.energy = 100;
        this.happiness = 100;
        this.age = 0;
        this.illness = false;
        this.emotions = '';
        this.knowledge = 0;
        this.skills = 0;
        this.bathing = false;
        this.currentMission = '';
        this.state = 'idle';
        this.goal = null;
    }

    serialize() {
        return {
            type: this.type,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            health: this.health,
            energy: this.energy,
            happiness: this.happiness,
            age: this.age,
            illness: this.illness,
            emotions: this.emotions,
            knowledge: this.knowledge,
            skills: this.skills,
            bathing: this.bathing,
            state: this.state,
            goal: this.goal
        };
    }
    //actualiza estado
    updateStats() {
        $('#pet-type').text('Tipo: ' + this.type);
        $('#pet-level').text('Nivel: ' + this.level);
        $('#pet-xp').text(`XP: ${this.xp}/${this.xpToNextLevel}`);
        $('#pet-health').text('Salud: ' + this.health);
        $('#pet-energy').text('Energía: ' + this.energy);
        $('#pet-happiness').text('Felicidad: ' + this.happiness);
        $('#pet-age').text('Edad: ' + this.age);
        $('#pet-illness').text('Enfermedad: ' + (this.illness ? 'Sí' : 'No'));
        $('#pet-emotions').text('Emociones: ' + this.emotions);

        $('#progress-health').css('width', this.health + '%').text('Salud ' + this.health + '%').hide().fadeIn(1000);
        $('#progress-energy').css('width', this.energy + '%').text('Energía ' + this.energy + '%').hide().fadeIn(1000);
        $('#progress-happiness').css('width', this.happiness + '%').text('Felicidad ' + this.happiness + '%').hide().fadeIn(1000);

        this.updateImage();
    }
    //gana experiencia
    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        this.updateStats();
    }
    //sube nivel
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.30);
        this.health = Math.min(this.health + 20, 100);
        this.energy = Math.min(this.energy + 20, 100);
        this.happiness = Math.min(this.happiness + 10, 100);
        player.showMsg(`¡Tu GhostPet ha subido al nivel ${this.level}!`, 'success');
        this.updateStats();
        this.unlockAbilities();
        player.saveProgress();
    }
    //desbloquea habilidades
    unlockAbilities() {
        const abilities = {
            2: 'Double Jump',
            5: 'Fireball',
            10: 'Invisibility'
        };
        if (abilities[this.level]) {
            player.showMsg(`¡Has desbloqueado una nueva habilidad: ${abilities[this.level]}!`, 'success');
        }
    }
    //actualiza imagen
    updateImage() {
        const levels = { fantasma: 3, espectro: 3, wraith: 3, poltergeist: 3, banshee: 3 };
        let imagePath = `assets/img/${this.type}${Math.min(this.level, levels[this.type] || 1)}.webp`;
        $('#pet-image').attr('src', imagePath).hide().fadeIn(1000);
    }
    //obtiene la ruta de la imagen
    getImagePath() {
        const levels = { fantasma: 3, espectro: 3, wraith: 3, poltergeist: 3, banshee: 3 };
        return `assets/img/${this.type}${Math.min(this.level, levels[this.type] || 1)}.webp`;
    }
    //inicia actividad
    performActivity(activity) {
        if (this.illness && (activity === 'jugar' || activity === 'estudiar')) {
            player.showMsg('Tu GhostPet está enfermo y no puede realizar esta actividad.', 'warning');
            return;
        }

        if (this.energy <= 0 && activity !== 'descansar') {
            player.showMsg('Tu GhostPet está cansado y necesita descansar.', 'warning');
            return;
        }

        const activityEffects = {
            alimentar: { energy: 20, happiness: 10, xp: 20 },
            estudiar: { energy: -15, happiness: 15, knowledge: 20, xp: 25 },
            trabajar: { energy: -25, happiness: -10, health: 15, knowledge: 10, xp: 30 },
            ejercicio: { health: 20, energy: -15, happiness: 10, xp: 20 },
            meditar: { energy: 15, happiness: 15, xp: 10 },
            socializar: { happiness: 20, energy: -10, xp: 15 },
            entrenamiento: { skills: 15, energy: -20, happiness: -10, health: 20, xp: 30 },
            baño: { health: 15, happiness: 15, xp: 10 },
            descansar: { energy: 30, happiness: 10, health: 15, xp: 5 }
        };

        const effects = activityEffects[activity];
        if (effects) {
            this.applyEffects(effects);
            if (activity === 'baño') {
                this.bathing = true;
                setTimeout(() => { this.bathing = false; }, 5000);
            }
            if (activity === 'descansar') {
                this.energy = 100;
                setTimeout(() => { this.energy = false; }, 15000);
            }
            this.state = activity;
            player.showMsg(`Tu GhostPet ha realizado la actividad: ${activity}`, 'info');
        }
        this.updateStats();
        this.checkRandomEvent();
        player.saveProgress();
    }
    //aplica efectos de la actividad
    applyEffects(effects) {
        Object.keys(effects).forEach(key => {
            this[key] = Math.min(this[key] + effects[key], 100);
        });
        if (effects.xp) {
            this.gainXP(effects.xp);
        }
    }

    startMission(mission) {
        $('#minigameModal').modal('show');
        this.currentMission = mission;
        this.state = 'onMission';
    }
    //metodo mision
    completeMission() {
        const missionEffects = {
            vencerCriaturas: {
                health: -15,
                skills: 22.5,
                happiness: 15,
                xp: 45,
                coins: 75,
                rewards: ["75 monedas"]
            },
            resolverPuzles: {
                knowledge: 30,
                energy: -15,
                happiness: 7.5,
                xp: 37.5,
                coins: 45,
                rewards: ["45 monedas"]
            },
            desafiosConocimiento: {
                knowledge: 37.5,
                energy: -22.5,
                xp: 52.5,
                coins: 60,
                rewards: ["60 monedas"]
            },
            busquedaTesoros: {
                happiness: 30,
                energy: -15,
                skills: 15,
                xp: 30,
                coins: 30,
                rewards: ["30 monedas"]
            },
            rescatarCriaturas: {
                health: -10,
                happiness: 25,
                xp: 50,
                coins: 80,
                rewards: ["80 monedas"]
            },
            explorarMontana: {
                knowledge: 40,
                energy: -20,
                skills: 25,
                xp: 60,
                coins: 90,
                rewards: ["90 monedas"]
            },
            desafiosSabiduria: {
                knowledge: 50,
                energy: -30,
                xp: 70,
                coins: 100,
                rewards: ["100 monedas"]
            }
        };

        const effects = missionEffects[this.currentMission];
        if (effects) {
            this.applyEffects(effects);
            player.coins += effects.coins || 0;
            player.updateCoins();
            player.addMissionToHistory({ description: `Misión: ${this.currentMission}`, rewards: effects.rewards });
            player.showMsg(`Tu GhostPet ha completado la misión: ${this.currentMission}`, "info");
        } else {
            player.showMsg("Tu GhostPet no tiene suficiente energía para realizar esta misión.", "warning");
        }
        this.state = 'idle';
        this.updateStats();
        this.checkRandomEvent();
        player.saveProgress();
    }
    //metodo para explorear area
    exploreArea(area) {
        const explorationEvents = [
            () => this.findRandomItem(),
            () => this.startRandomMission(),
            () => this.randomBattle(),
            () => this.findCoins(),
            () => this.loseCoins(),
            () => this.changeRandomStats()
        ];

        const randomEvent = explorationEvents[Math.floor(Math.random() * explorationEvents.length)];
        randomEvent();
        player.addMissionToHistory({ description: `Exploración en ${area}`, rewards: [] });
        player.showMsg(`Tu GhostPet ha explorado: ${area}`, 'info');
        this.updateStats();
        player.saveProgress();
    }
    //metodo que inicia una mision al azar
    startRandomMission() {
        const missions = ['vencerCriaturas', 'resolverPuzles', 'desafiosConocimiento', 'busquedaTesoros', 'rescatarCriaturas', 'explorarMontana', 'desafiosSabiduria'];
        const mission = missions[Math.floor(Math.random() * missions.length)];
        this.startMission(mission);
    }
    //metodo para encontrar moneda
    findCoins() {
        const coinsFound = Math.floor(Math.random() * 100);
        player.coins += coinsFound;
        player.showMsg(`Tu GhostPet ha encontrado ${coinsFound} monedas!`, 'success');
    }
    //metodo para perder moneda
    loseCoins() {
        const coinsLost = Math.floor(Math.random() * 50);
        player.coins = Math.max(player.coins - coinsLost, 0);
        player.showMsg(`Tu GhostPet ha perdido ${coinsLost} monedas.`, 'danger');
    }
    //metodo para cambiar estado
    changeRandomStats() {
        const stats = ['health', 'energy', 'happiness', 'knowledge', 'skills'];
        const stat = stats[Math.floor(Math.random() * stats.length)];
        const change = Math.floor(Math.random() * 21) - 10; // Cambios entre -10 y +10
        this[stat] = Math.min(Math.max(this[stat] + change, 0), 100);
        player.showMsg(`Las estadísticas de tu GhostPet han cambiado: ${stat} ${change > 0 ? '+' : ''}${change}`, 'info');
    }
    //metodo para checkear eventos al azar
    checkRandomEvent() {
        const randomEvent = Math.random();
        if (randomEvent < 0.1) {
            this.illness = true;
            this.health -= 20;
            player.showMsg('Tu GhostPet se ha enfermado.', 'warning');
        } else if (randomEvent < 0.2) {
            const item = this.findRandomItem();
            player.addItemToInventory(item);
        }
    }
    //metodo para encontrar un objeto al azar
    findRandomItem() {
        const items = [
            { name: 'Pastel', type: 'comida', value: 20, effect: { health: 10, energy: 10, happiness: 10, xp: 10 } },
            { name: 'Hamburguesa', type: 'comida', value: 10, effect: { health: 10, energy: 10, happiness: 10, xp: 5 } },
            { name: 'Empanada', type: 'comida', value: 25, effect: { health: 10, energy: 10, happiness: 10, xp: 10 } },
            { name: 'Juguito', type: 'comida', value: 10, effect: { health: 10, energy: 10, happiness: 10, bathing: -20, xp: 5 } },
            { name: 'Hierbas', type: 'medicina', value: 10, effect: { health: 20, xp: 5 } },
            { name: 'Jarabe', type: 'medicina', value: 30, effect: { health: 40, xp: 10 } },
            { name: 'Pildora', type: 'medicina', value: 50, effect: { health: 60, xp: 10 } },
            { name: 'Vacuna', type: 'medicina', value: 70, effect: { health: 100, happiness: -30, bathing: -20, energy: 10, xp: 15 } },
            { name: 'Trompo', type: 'juguete', value: 15, effect: { happiness: 10, energy: -5, xp: 5 } },
            { name: 'Cartas', type: 'juguete', value: 15, effect: { happiness: 15, knowledge: 10, xp: 10 } },
            { name: 'Consola', type: 'juguete', value: 15, effect: { happiness: 20, bathing: -10, energy: -10, xp: 15 } },
            { name: 'Computador', type: 'juguete', value: 15, effect: { happiness: 25, knowledge: 15, energy: -10, xp: 20 } },
            { name: 'Cuchillo', type: 'arma', value: 30, effect: { skills: 10, xp: 15 } },
            { name: 'Espada', type: 'arma', value: 40, effect: { skills: 15, xp: 20 } },
            { name: 'Arco', type: 'arma', value: 50, effect: { skills: 20, xp: 25 } },
            { name: 'Baston Mágico', type: 'arma', value: 60, effect: { skills: 25, xp: 30 } },
            { name: 'Libro de Magia', type: 'herramienta', value: 20, effect: { knowledge: 15, xp: 10, happiness: 10 } },
            { name: 'Libro de Mecanica', type: 'herramienta', value: 25, effect: { knowledge: 15, xp: 10, happiness: 10 } },
            { name: 'Tijeras', type: 'herramienta', value: 20, effect: { knowledge: 10, energy: -5, xp: 10 } },
            { name: 'Martillo', type: 'herramienta', value: 30, effect: { knowledge: 10, energy: -10, xp: 10 } }
        ];
        return items[Math.floor(Math.random() * items.length)];
    }
    //metodo para utilizar un objeto
    applyItem(item) {
        this.applyEffects(item.effect);
        player.showMsg(`Has usado ${item.name} en tu GhostPet.`, 'info');
        player.saveProgress();
    }
    //metodo para cumplir edad
    increaseAge() {
        setInterval(() => {
            this.age++;
            player.showMsg(`¡Tu GhostPet ha cumplido ${this.age} años!`, 'info');
            this.updateStats();
            player.saveProgress();
        }, 500000);
    }
    //metodo para actualizar estado
    deserialize(data) {
        Object.assign(this, data);
        this.updateImage();
        this.updateStats();
    }
    //metodo para decidir actividad al azar
    decideActivity() {
        if (this.health < 50) return 'alimentar';
        if (this.energy < 50) return 'descansar';
        if (this.happiness < 50) return 'socializar';
        return 'ejercicio';
    }
    //decide una actividad basado en la hora
    decideActivityBasedOnTime() {
        const hours = new Date().getHours();
        if (hours >= 6 && hours < 18) {
            return 'explorar';
        } else {
            return this.decideActivity();
        }
    }
    //metodo para ganar
    setGoal(goal) {
        this.goal = goal;
    }
    //actualiza el estado
    updateState() {
        if (this.goal) {
            switch (this.goal.type) {
                case 'levelUp':
                    if (this.level < this.goal.targetLevel) {
                        this.state = 'training';
                    } else {
                        this.goal = null;
                        this.state = 'idle';
                    }
                    break;
                case 'explore':
                    if (this.goal.area) {
                        this.state = 'exploring';
                    } else {
                        this.goal = null;
                        this.state = 'idle';
                    }
                    break;
                default:
                    this.state = 'idle';
                    break;
            }
        }
    }

    // Método para iniciar una batalla aleatoria
    randomBattle() {
        const npc1Stats = this.calculateStats();
        const npc2Stats = this.calculateStats();
        const winner = npc1Stats > npc2Stats ? 'NPC1' : 'NPC2';
        player.showMsg(`¡Batalla aleatoria! ${winner} ha ganado.`, 'info');
    }

    // Método para calcular estadísticas para la batalla
    calculateStats() {
        return Math.floor(Math.random() * 100);
    }
}
