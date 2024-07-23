class MiniGame {
    constructor(name) {
        this.name = name;
        this.isPlaying = false;
    }

    start() {
        this.isPlaying = true;
        $('#minigameModal').modal('show');
        $('#minigameModalLabel').text(this.name);
        $('#minigameModal .modal-body').html(this.getMiniGameContent());
        this.bindEvents();
    }

    getMiniGameContent() {
        // Aquí puedes agregar contenido HTML para tu mini-juego
        return `<div id="minigame-content">
                    <p>¡Bienvenido al mini-juego ${this.name}!</p>
                    <button id="end-minigame" class="btn btn-success">Terminar Mini-juego</button>
                </div>`;
    }

    bindEvents() {
        $('#end-minigame').on('click', () => this.end());
    }

    end() {
        this.isPlaying = false;
        $('#minigameModal').modal('hide');
        player.showMsg(`Has terminado el mini-juego ${this.name}.`, 'info');
        // Aquí puedes añadir la lógica para recompensas
    }
}
