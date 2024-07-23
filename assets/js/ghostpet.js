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
        this.state = 'idle'; // Nuevo estado inicial
        this.goal = null; // Nuevo objetivo
    }

    // Método para serializar las propiedades del NPC
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
            state: this.state, // Incluir estado en la serialización
            goal: this.goal // Incluir objetivo en la serialización
        };
    }

    // Método para actualizar las estadísticas del NPC
    updateStats() {
        $('#pet-type').text('Tipo: ' + this.type);
        $('#pet-level').text('Nivel: ' + this.level);
        $('#pet-xp').text('XP: ' + this.xp + '/' + this.xpToNextLevel);
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

    // Método para ganar experiencia
    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        this.updateStats();
    }

    // Método para subir de nivel
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.30);
        this.health = Math.min(this.health + 20, 100);
        this.energy = Math.min(this.energy + 20, 100);
        this.happiness = Math.min(this.happiness + 10, 100);
        player.showMsg(`¡Tu GhostPet ha subido al nivel ${this.level}!`, 'success');
        this.updateStats();
        player.saveProgress();
    }

    // Método para actualizar la imagen del NPC
    updateImage() {
        const levels = { fantasma: 3, espectro: 3, wraith: 3, poltergeist: 3, banshee: 3 };
        let imagePath = `assets/img/${this.type}${Math.min(this.level, levels[this.type] || 1)}.webp`;
        $('#pet-image').attr('src', imagePath).hide().fadeIn(1000);
    }

    // Método para obtener la ruta de la imagen
    getImagePath() {
        const levels = { fantasma: 3, espectro: 3, wraith: 3, poltergeist: 3, banshee: 3 };
        return `assets/img/${this.type}${Math.min(this.level, levels[this.type] || 1)}.webp`;
    }

    // Método para realizar una actividad
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
            this.state = activity; // Actualizar el estado
            player.showMsg(`Tu GhostPet ha realizado la actividad: ${activity}`, 'info');
        }
        this.updateStats();
        this.checkRandomEvent();
        player.saveProgress();
    }

    // Método para aplicar los efectos de una actividad
    applyEffects(effects) {
        Object.keys(effects).forEach(key => {
            this[key] = Math.min(this[key] + effects[key], 100);
        });
        if (effects.xp) {
            this.gainXP(effects.xp);
        }
    }

    // Método para iniciar una misión
    startMission(mission) {
        $('#minigameModal').modal('show');
        this.currentMission = mission;
        this.state = 'onMission'; // Actualizar el estado
    }

    // Método para completar una misión
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
        this.state = 'idle'; // Actualizar el estado
        this.updateStats();
        this.checkRandomEvent();
        player.saveProgress();
    }

    // Método para explorar un área
    exploreArea(area) {
        const explorationEffects = {
            bosqueEncantado: {
                xp: 30,
                energy: -10,
                happiness: 20,
                knowledge: 15
            },
            montanaMisteriosa: {
                xp: 40,
                energy: -20,
                health: 10,
                skills: 20
            },
            cuevaSecreta: {
                xp: 50,
                energy: -25,
                happiness: 25,
                knowledge: 20
            }
        };

        const effects = explorationEffects[area];
        if (effects) {
            this.applyEffects(effects);
            player.showMsg(`Tu GhostPet ha explorado: ${area}`, 'info');
        } else {
            player.showMsg("No se puede explorar esta área.", "warning");
        }
        this.updateStats();
        player.saveProgress();
    }

    // Método para comprobar eventos aleatorios
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

    // Método para encontrar un objeto aleatorio
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

    // Método para aplicar un objeto al NPC
    applyItem(item) {
        this.applyEffects(item.effect);
        player.showMsg(`Has usado ${item.name} en tu GhostPet.`, 'info');
        player.saveProgress();
    }

    // Método para incrementar la edad del NPC
    increaseAge() {
        setInterval(() => {
            this.age++;
            player.showMsg(`¡Tu GhostPet ha cumplido ${this.age} años!`, 'info');
            this.updateStats();
            player.saveProgress();
        }, 500000);
    }

    // Método para deserializar los datos del NPC
    deserialize(data) {
        Object.assign(this, data);
        this.updateImage();
        this.updateStats();
    }

    // Nueva función: decidir actividad basada en la salud
    decideActivity() {
        if (this.health < 50) return 'alimentar';
        if (this.energy < 50) return 'descansar';
        if (this.happiness < 50) return 'socializar';
        return 'ejercicio';
    }

    // Nueva función: decidir actividad basada en la hora del día
    decideActivityBasedOnTime() {
        const hours = new Date().getHours();
        if (hours >= 6 && hours < 18) {
            return 'explorar';
        } else {
            return this.decideActivity();
        }
    }

    // Método para establecer un nuevo objetivo
    setGoal(goal) {
        this.goal = goal;
    }

    // Método para actualizar el estado basado en el objetivo actual
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
                // Otros casos según los objetivos
                default:
                    this.state = 'idle';
                    break;
            }
        }
    }
}
